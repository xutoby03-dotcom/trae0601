import { useGroomingStore } from '@/store/useGroomingStore'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianAxis } from 'recharts'
import { SERVICE_LABELS } from '@/types'
import type { ServiceType } from '@/types'
import { format, parseISO } from 'date-fns'
import { TrendingUp, Star, ShoppingBag } from 'lucide-react'

const PIE_COLORS = ['#E8A87C', '#A8D5BA', '#F5C6AA', '#8B7E74', '#3D2B1F', '#D4C5B9', '#C9E4CA']

export default function Stats() {
  const appointments = useGroomingStore((s) => s.appointments)
  const groomingRecords = useGroomingStore((s) => s.groomingRecords)
  const pets = useGroomingStore((s) => s.pets)

  const completedApts = appointments.filter((a) => a.status === 'completed')

  const monthlySpend = useMemo(() => {
    const map: Record<string, number> = {}
    groomingRecords.forEach((r) => {
      const month = format(parseISO(r.completedAt), 'yyyy-MM')
      map[month] = (map[month] || 0) + r.actualCost
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }))
  }, [groomingRecords])

  const totalSpend = groomingRecords.reduce((s, r) => s + r.actualCost, 0)

  const shopStats = useMemo(() => {
    const map: Record<string, { scores: number[]; visits: number }> = {}
    completedApts.forEach((apt) => {
      if (!apt.shopName) return
      const record = groomingRecords.find((r) => r.appointmentId === apt.id)
      if (!map[apt.shopName]) map[apt.shopName] = { scores: [], visits: 0 }
      map[apt.shopName].visits += 1
      if (record) map[apt.shopName].scores.push(record.satisfactionScore)
    })
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        avgScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
        visits: data.visits,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [completedApts, groomingRecords])

  const serviceStats = useMemo(() => {
    const map: Record<string, number> = {}
    completedApts.forEach((apt) => {
      apt.services.forEach((svc) => {
        map[svc] = (map[svc] || 0) + 1
      })
    })
    return Object.entries(map)
      .map(([svc, count]) => ({ name: SERVICE_LABELS[svc as ServiceType] || svc, value: count }))
      .sort((a, b) => b.value - a.value)
  }, [completedApts])

  if (completedApts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📊</div>
        <h2 className="font-display text-2xl text-[#3D2B1F] mb-2">美容统计</h2>
        <p className="text-[#8B7E74]">完成美容后就能看到统计数据啦</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-[#3D2B1F]">美容统计</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8A87C]/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-[#E8A87C]" />
            </div>
            <span className="text-xs text-[#8B7E74]">年度总花费</span>
          </div>
          <div className="text-2xl font-bold text-[#3D2B1F]">¥{totalSpend}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#A8D5BA]/30 flex items-center justify-center">
              <Star size={16} className="text-[#A8D5BA]" />
            </div>
            <span className="text-xs text-[#8B7E74]">美容次数</span>
          </div>
          <div className="text-2xl font-bold text-[#3D2B1F]">{completedApts.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5C6AA]/30 flex items-center justify-center">
              <ShoppingBag size={16} className="text-[#F5C6AA]" />
            </div>
            <span className="text-xs text-[#8B7E74]">毛孩数量</span>
          </div>
          <div className="text-2xl font-bold text-[#3D2B1F]">{pets.length}</div>
        </div>
      </div>

      {monthlySpend.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-5">
          <h3 className="font-display text-lg text-[#3D2B1F] mb-4">月度花费趋势</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlySpend}>
              <CartesianAxis strokeDasharray="3 3" stroke="#E8D5C4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B7E74' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8B7E74' }} />
              <Tooltip
                formatter={(value: number) => [`¥${value}`, '花费']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E8A87C40', fontSize: 12 }}
              />
              <Bar dataKey="amount" fill="#E8A87C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {shopStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-5">
          <h3 className="font-display text-lg text-[#3D2B1F] mb-4">美容店评分</h3>
          <div className="space-y-3">
            {shopStats.map((shop, idx) => (
              <div key={shop.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  idx === 0 ? 'bg-[#E8A87C]' : idx === 1 ? 'bg-[#A8D5BA]' : 'bg-[#D4C5B9]'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3D2B1F] truncate">{shop.name}</span>
                    <span className="text-xs text-[#8B7E74] ml-2">{shop.visits}次</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        className={n <= Math.round(shop.avgScore) ? 'text-[#E8A87C] fill-[#E8A87C]' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-xs text-[#8B7E74] ml-1">{shop.avgScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {serviceStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-5">
          <h3 className="font-display text-lg text-[#3D2B1F] mb-4">项目频率</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={serviceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {serviceStats.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}次`, '次数']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {serviceStats.map((svc, idx) => (
                <div key={svc.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-[#3D2B1F]">{svc.name}</span>
                  <span className="text-[#8B7E74] text-xs ml-auto">{svc.value}次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
