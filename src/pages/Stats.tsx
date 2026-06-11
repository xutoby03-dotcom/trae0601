import { useStore } from '@/store/useStore'
import { getLevelLabel } from '@/utils/degradation'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import { AlertTriangle, Activity, BarChart3 } from 'lucide-react'
import type { DegradationLevel } from '@/store/types'

const LEVELS: DegradationLevel[] = ['A', 'B', 'C', 'D', 'E']
const LEVEL_COLORS: Record<DegradationLevel, string> = {
  A: '#10b981',
  B: '#f59e0b',
  C: '#f97316',
  D: '#ef4444',
  E: '#f43f5e',
}

export default function Stats() {
  const { vehicles, checkupRecords } = useStore()

  const totalVehicles = vehicles.length
  const highRiskCount = vehicles.filter((v) => v.degradationLevel === 'D' || v.degradationLevel === 'E').length
  const avgScore = checkupRecords.length
    ? Math.round(checkupRecords.reduce((s, r) => s + r.degradationScore, 0) / checkupRecords.length)
    : 0

  const pieData = LEVELS.map((level) => ({
    name: `${level} · ${getLevelLabel(level)}`,
    value: vehicles.filter((v) => v.degradationLevel === level).length,
    color: LEVEL_COLORS[level],
  })).filter((d) => d.value > 0)

  const monthlyMap = new Map<string, { sum: number; count: number }>()
  checkupRecords.forEach((r) => {
    const month = r.date.slice(0, 7)
    const entry = monthlyMap.get(month) || { sum: 0, count: 0 }
    entry.sum += r.degradationScore
    entry.count += 1
    monthlyMap.set(month, entry)
  })
  const trendData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { sum, count }]) => ({ month, score: Math.round(sum / count) }))

  const buildingMap = new Map<string, { total: number; checked: number }>()
  vehicles.forEach((v) => {
    const entry = buildingMap.get(v.building) || { total: 0, checked: 0 }
    entry.total += 1
    if (v.lastCheckupDate) entry.checked += 1
    buildingMap.set(v.building, entry)
  })
  const buildingData = Array.from(buildingMap.entries())
    .map(([building, { total, checked }]) => ({
      building,
      rate: Math.round((checked / total) * 100),
    }))
    .sort((a, b) => b.rate - a.rate)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-zinc-50">统计中心</h1>

      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> 风险概览
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <Activity className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
            <div className="text-2xl font-black text-zinc-100">{totalVehicles}</div>
            <div className="text-[10px] text-zinc-500">车辆总数</div>
          </div>
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-2xl font-black text-red-400">{highRiskCount}</div>
            <div className="text-[10px] text-zinc-500">高危(D+E)</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <Activity className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl font-black text-amber-400">{avgScore}</div>
            <div className="text-[10px] text-zinc-500">平均衰减分</div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#e4e4e7' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> 衰减趋势
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          {trendData.length === 0 ? (
            <p className="text-zinc-500 text-center py-10 text-sm">暂无体检数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" /> 楼栋排行
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          {buildingData.length === 0 ? (
            <p className="text-zinc-500 text-center py-10 text-sm">暂无楼栋数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={buildingData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis type="category" dataKey="building" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => `${v}%`}
                />
                <Bar dataKey="rate" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  )
}
