import { useNavigate } from 'react-router-dom'
import { usePhoneStore } from '@/store'
import type { Phone } from '@/types'
import { calculateValuation } from '@/utils/valuation'
import { Banknote, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ISSUE_MAP: Record<string, string> = {
  '屏幕碎裂': 'cracked',
  '屏幕划痕': 'scratched',
  '电池衰减': 'battery',
  '进水损伤': 'water',
  '账号未退出': 'account',
}

function getMissingFields(phone: Phone): string[] {
  const missing: string[] = []
  if (!phone.capacity) missing.push('容量')
  if (!phone.purchaseYear) missing.push('购入年份')
  if (phone.batteryHealth === null) missing.push('电池健康度')
  return missing
}

function getBarColor(pct: number): string {
  if (pct < 0.15) return '#52B788'
  if (pct < 0.25) return '#F77F00'
  return '#E63946'
}

export default function Stats() {
  const navigate = useNavigate()
  const { phones, transactions } = usePhoneStore()

  const totalRecycled = transactions.reduce((sum, t) => sum + t.finalPrice, 0)
  const pendingCount = phones.filter((p) => !transactions.some((t) => t.phoneId === p.id)).length
  const avgPrice = transactions.length > 0 ? totalRecycled / transactions.length : 0

  const incompletePhones = phones
    .map((p) => ({ phone: p, missing: getMissingFields(p) }))
    .filter((item) => item.missing.length > 0)

  const deductionData = Object.entries(ISSUE_MAP).map(([label, key]) => {
    const matched = phones.filter((p) => {
      const result = calculateValuation(p)
      return result.deductions.some((d) => {
        if (key === 'cracked') return d.label === '屏幕碎裂'
        if (key === 'scratched') return d.label === '屏幕划痕'
        if (key === 'battery') return d.label.includes('电池')
        if (key === 'water') return d.label === '进水损伤'
        if (key === 'account') return d.label === '账号未退出'
        return false
      })
    })
    if (matched.length === 0) return { name: label, pct: 0, color: '#52B788' }
    const pcts = matched.map((p) => {
      const result = calculateValuation(p)
      const d = result.deductions.find((d) => {
        if (key === 'cracked') return d.label === '屏幕碎裂'
        if (key === 'scratched') return d.label === '屏幕划痕'
        if (key === 'battery') return d.label.includes('电池')
        if (key === 'water') return d.label === '进水损伤'
        if (key === 'account') return d.label === '账号未退出'
        return false
      })
      return d ? d.percentage : 0
    })
    const avgPct = pcts.reduce((a, b) => a + b, 0) / pcts.length
    return { name: label, pct: Math.round(avgPct * 100), color: getBarColor(avgPct) }
  }).filter((d) => d.pct > 0)

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F0F5F1' }}>
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold mb-4" style={{ color: '#1B4332' }}>统计总览</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center">
            <Banknote size={20} style={{ color: '#F77F00' }} />
            <span className="text-xs text-gray-500 mt-1">已回收总额</span>
            <span className="text-lg font-bold mt-0.5" style={{ color: '#F77F00' }}>¥{totalRecycled.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center">
            <Clock size={20} style={{ color: '#1B4332' }} />
            <span className="text-xs text-gray-500 mt-1">待处理手机</span>
            <span className="text-lg font-bold mt-0.5" style={{ color: '#1B4332' }}>{pendingCount}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center">
            <TrendingUp size={20} style={{ color: '#52B788' }} />
            <span className="text-xs text-gray-500 mt-1">平均回收单价</span>
            <span className="text-lg font-bold mt-0.5" style={{ color: '#52B788' }}>¥{Math.round(avgPrice).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 mb-6" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-amber-800">缺资料提醒</h2>
          </div>
          {incompletePhones.length === 0 ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#52B788' }}>
              <CheckCircle size={16} />
              <span>所有手机资料完整 ✓</span>
            </div>
          ) : (
            <div className="space-y-2">
              {incompletePhones.map(({ phone, missing }) => (
                <div key={phone.id} className="flex items-center justify-between bg-white rounded-lg p-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-800">{phone.brand} {phone.model || '未知型号'}</span>
                    <span className="text-amber-600 ml-2">缺少: {missing.join('、')}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/phone/${phone.id}/edit?from=stats`)}
                    className="shrink-0 ml-2 rounded-lg px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors"
                    style={{ background: 'rgba(245,158,11,0.15)' }}
                  >
                    去补充
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-semibold mb-4" style={{ color: '#1B4332' }}>问题影响排行</h2>
          {deductionData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无扣减数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={deductionData.length * 44 + 20}>
              <BarChart data={deductionData} layout="vertical" margin={{ left: 0, right: 40 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={24}>
                  {deductionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
