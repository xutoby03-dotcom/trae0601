import { useStore } from '@/store'
import { FILTER_TYPE_ICONS } from '@/types'
import type { FilterType } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ShoppingBag, TrendingUp, Package } from 'lucide-react'
import { useState } from 'react'

export default function Statistics() {
  const { replacements, filterConfigs, purifiers, getFiltersWithStatus } = useStore()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const currentYear = Number(selectedYear)
  const yearReplacements = replacements.filter((r) => {
    const d = new Date(r.replaceDate)
    return d.getFullYear() === currentYear
  })

  const totalCost = yearReplacements.reduce((sum, r) => sum + r.cost, 0)

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthReplacements = yearReplacements.filter((r) => new Date(r.replaceDate).getMonth() === i)
    return {
      month: format(new Date(currentYear, i, 1), 'M月', { locale: zhCN }),
      cost: monthReplacements.reduce((sum, r) => sum + r.cost, 0),
    }
  })

  const filterFrequency: Record<string, number> = {}
  yearReplacements.forEach((r) => {
    const fc = filterConfigs.find((f) => f.id === r.filterConfigId)
    if (fc) {
      filterFrequency[fc.filterType] = (filterFrequency[fc.filterType] || 0) + 1
    }
  })
  const frequencyData = Object.entries(filterFrequency)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  const filters = getFiltersWithStatus()
  const today = new Date()
  const expiringSoon = filters.filter((f) => {
    if (f.status === 'expired') return true
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() + 30)
    const endDate = new Date(f.lastReplaceDate || f.purifier.installDate)
    endDate.setDate(endDate.getDate() + f.suggestedLifespanDays)
    return endDate <= targetDate
  }).sort((a, b) => a.remainingDays - b.remainingDays)

  const availableYears = [...new Set(replacements.map((r) => new Date(r.replaceDate).getFullYear()))]
    .sort((a, b) => b - a)
  if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear)

  const COLORS = ['#0d9488', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">统计中心</h1>
          <p className="text-sm text-slate-400 mt-0.5">滤芯花费、更换频率与购买建议</p>
        </div>
        {availableYears.length > 1 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-brand-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg shadow-brand-500/20">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">年度总花费</span>
          </div>
          <p className="text-3xl font-display font-bold">¥{totalCost.toFixed(2)}</p>
          <p className="text-xs opacity-60 mt-1">{selectedYear}年 · {yearReplacements.length} 次换芯</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Package className="w-4 h-4" />
            <span className="text-xs font-medium">更换最频繁</span>
          </div>
          {frequencyData.length > 0 ? (
            <>
              <p className="text-2xl font-display font-bold text-slate-800">
                {FILTER_TYPE_ICONS[frequencyData[0].type as FilterType]} {frequencyData[0].type}
              </p>
              <p className="text-xs text-slate-400 mt-1">换了 {frequencyData[0].count} 次</p>
            </>
          ) : (
            <p className="text-sm text-slate-300">暂无数据</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-medium">待购清单</span>
          </div>
          <p className="text-2xl font-display font-bold text-slate-800">{expiringSoon.length}</p>
          <p className="text-xs text-slate-400 mt-1">30天内需更换的滤芯</p>
        </div>
      </div>

      {monthlyData.some((d) => d.cost > 0) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
          <h3 className="font-display text-sm font-semibold text-slate-700 mb-4">月度花费</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, '花费']}
                />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill={i === monthlyData.findIndex((d) => d.cost === Math.max(...monthlyData.map((m) => m.cost))) ? '#0d9488' : '#99f6e4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {frequencyData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
          <h3 className="font-display text-sm font-semibold text-slate-700 mb-4">换芯频率排名</h3>
          <div className="space-y-3">
            {frequencyData.map((item, i) => {
              const maxCount = frequencyData[0].count
              const barWidth = (item.count / maxCount) * 100
              return (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{FILTER_TYPE_ICONS[item.type as FilterType]}</span>
                  <span className="text-sm font-medium text-slate-700 w-16">{item.type}</span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700 ease-out"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-sm font-display font-semibold text-slate-600 w-8 text-right">{item.count}次</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-semibold text-slate-700">合并购买建议</h3>
            <button
              onClick={() => {
                const text = expiringSoon
                  .map((f) => `${f.filterType} - ${f.purifier.brand} ${f.purifier.model}${f.purchaseLink ? ' ' + f.purchaseLink : ''}`)
                  .join('\n')
                navigator.clipboard.writeText(text)
              }}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              复制清单
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">以下滤芯将在 30 天内到期，建议一起购买节省运费</p>
          <div className="space-y-2">
            {expiringSoon.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <span>{FILTER_TYPE_ICONS[f.filterType]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{f.filterType}</span>
                    <span className="text-xs text-slate-400">{f.purifier.brand} {f.purifier.model}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${f.status === 'expired' ? 'text-red-500 font-semibold' : 'text-amber-500'}`}>
                    {f.remainingDays <= 0 ? `已超期 ${Math.abs(f.remainingDays)} 天` : `${f.remainingDays} 天后到期`}
                  </p>
                </div>
                {f.purchaseLink && (
                  <a
                    href={f.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    去买 <ShoppingBag className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {replacements.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-brand-300" />
          </div>
          <p className="text-sm text-slate-400">添加换芯记录后即可查看统计数据</p>
        </div>
      )}
    </div>
  )
}
