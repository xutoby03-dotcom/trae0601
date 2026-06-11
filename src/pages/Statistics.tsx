import { useMemo } from 'react'
import { useStore } from '@/store'
import {
  BarChart3,
  TrendingDown,
  Package,
  RefreshCw,
  Users,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'

const CHART_COLORS = ['#0D3B2E', '#259971', '#E5A44D', '#DC3545', '#3DB88C', '#D4932E', '#1A6B4F', '#F59E0B']

export default function Statistics() {
  const { consumables, requisitions, restocks } = useStore()

  const groupConsumption = useMemo(() => {
    const approved = requisitions.filter((r) => r.status === 'approved')
    const advisorMap = new Map<string, { name: string; total: number }>()
    approved.forEach((r) => {
      const existing = advisorMap.get(r.advisor) || { name: r.advisor, total: 0 }
      existing.total += r.quantity
      advisorMap.set(r.advisor, existing)
    })
    return Array.from(advisorMap.values()).sort((a, b) => b.total - a.total)
  }, [requisitions])

  const consumableConsumption = useMemo(() => {
    const approved = requisitions.filter((r) => r.status === 'approved')
    const map = new Map<string, { name: string; total: number }>()
    approved.forEach((r) => {
      const c = consumables.find((item) => item.id === r.consumableId)
      const name = c?.name || '未知'
      const existing = map.get(r.consumableId) || { name, total: 0 }
      existing.total += r.quantity
      map.set(r.consumableId, existing)
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [requisitions, consumables])

  const restockTimeline = useMemo(() => {
    const sorted = [...restocks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const dateMap = new Map<string, number>()
    sorted.forEach((r) => {
      const date = format(parseISO(r.createdAt), 'MM/dd')
      dateMap.set(date, (dateMap.get(date) || 0) + r.quantity)
    })
    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }))
  }, [restocks])

  const shortageRank = useMemo(() => {
    return consumables
      .filter((c) => c.stock < c.minAlert)
      .map((c) => ({
        name: c.name,
        current: c.stock,
        alert: c.minAlert,
        deficit: c.minAlert - c.stock,
      }))
      .sort((a, b) => b.deficit - a.deficit)
  }, [consumables])

  const stockDistribution = useMemo(() => {
    const normal = consumables.filter((c) => c.stock >= c.minAlert && !c.isHazardous).length
    const low = consumables.filter((c) => c.stock < c.minAlert && !c.isHazardous).length
    const hazardous = consumables.filter((c) => c.isHazardous).length
    return [
      { name: '库存正常', value: normal, color: '#10B981' },
      { name: '低库存', value: low, color: '#F59E0B' },
      { name: '危化品', value: hazardous, color: '#DC3545' },
    ]
  }, [consumables])

  const restockFrequency = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>()
    restocks.forEach((r) => {
      const c = consumables.find((item) => item.id === r.consumableId)
      const name = c?.name || '未知'
      const existing = map.get(r.consumableId) || { name, count: 0 }
      existing.count += 1
      map.set(r.consumableId, existing)
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [restocks, consumables])

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-lab-900">统计分析</h1>
        <p className="text-sm text-gray-500 mt-1">课题组消耗、补货频率和短缺情况一览</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lab-50 flex items-center justify-center">
            <Package className="w-5 h-5 text-lab-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">耗材种类</p>
            <p className="text-xl font-serif font-bold text-lab-900">{consumables.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-safe-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">领用总次数</p>
            <p className="text-xl font-serif font-bold text-lab-900">
              {requisitions.filter((r) => r.status === 'approved').length}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-warn-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">补货总次数</p>
            <p className="text-xl font-serif font-bold text-lab-900">{restocks.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-danger-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">低库存数</p>
            <p className="text-xl font-serif font-bold text-danger-500">
              {consumables.filter((c) => c.stock < c.minAlert).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-lab-600" />
            <h2 className="section-title">课题组消耗量</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupConsumption} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#0D3B2E" radius={[4, 4, 0, 0]} name="领用量" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-warn-600" />
            <h2 className="section-title">补货频率趋势</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={restockTimeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#E5A44D"
                  strokeWidth={2}
                  dot={{ fill: '#E5A44D', r: 4 }}
                  name="补货量"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-danger-500" />
            <h2 className="section-title">短缺排行</h2>
          </div>
          {shortageRank.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">暂无短缺耗材</p>
          ) : (
            <div className="space-y-2">
              {shortageRank.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                    ${i === 0 ? 'bg-danger-500' : i === 1 ? 'bg-warn-500' : i === 2 ? 'bg-amber-500' : 'bg-gray-300'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      当前 {item.current} / 警戒线 {item.alert}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-danger-500">-{item.deficit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-lab-600" />
            <h2 className="section-title">库存分布</h2>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-lab-600" />
            <h2 className="section-title">耗材消耗量排行</h2>
          </div>
          <div className="space-y-2">
            {consumableConsumption.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.total / (consumableConsumption[0]?.total || 1)) * 100}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-2">补货次数</p>
            {restockFrequency.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-600">{item.name}</span>
                <span className="text-xs font-medium text-lab-700">{item.count} 次</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
