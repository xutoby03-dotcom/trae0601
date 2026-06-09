import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  Sparkles,
  PackageOpen,
  Armchair,
  Sofa,
  Volume2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { SEAT_TYPE_LABELS, SeatType } from '../types'
import { getStats } from '../store'

const COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Stats() {
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null)

  useEffect(() => {
    setStats(getStats())
  }, [])

  if (!stats) return null

  const peakTimeData = stats.peakTimes.map(t => ({
    name: t.time,
    预约量: t.count,
  }))

  const popularSpotData = stats.popularSpots.filter(s => s.usageCount > 0).slice(0, 6).map(s => ({
    name: s.name,
    预约量: s.usageCount,
  }))

  const statusData = [
    { name: '已完成', value: stats.completedCount, color: '#22c55e' },
    { name: '爽约', value: stats.noShowCount, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const TYPE_ICONS: Record<SeatType, React.ReactNode> = {
    lounge: <Armchair className="w-4 h-4" />,
    sofa: <Sofa className="w-4 h-4" />,
    quiet_corner: <Volume2 className="w-4 h-4" />,
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">数据统计</h2>
        <p className="text-slate-400 text-sm mt-1">午休座位使用情况概览</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '总预约数', value: stats.totalReservations, icon: <BarChart3 className="w-5 h-5" />, bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-300' },
          { label: '已完成', value: stats.completedCount, icon: <TrendingUp className="w-5 h-5" />, bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-300' },
          { label: '爽约次数', value: stats.noShowCount, icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-300' },
          { label: '爽约率', value: `${stats.noShowRate}%`, icon: <Clock className="w-5 h-5" />, bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-300' },
        ].map(item => (
          <motion.div
            key={item.label}
            whileHover={{ y: -2 }}
            className={`rounded-xl border p-5 ${item.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className={item.text}>{item.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${item.text}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            最抢手座位
          </h3>
          {popularSpotData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularSpotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="预约量" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
              暂无使用数据
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            午休高峰时段
          </h3>
          {peakTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="预约量" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
              暂无时段数据
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            预约完成率
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
              暂无完成数据
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            座位使用排行
          </h3>
          <div className="space-y-3">
            {stats.popularSpots.slice(0, 5).map((spot, idx) => (
              <div key={spot.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-300' :
                  idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                  idx === 2 ? 'bg-orange-500/20 text-orange-300' :
                  'bg-slate-700 text-slate-500'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex items-center gap-2 text-indigo-300">
                  {TYPE_ICONS[spot.seatType]}
                </div>
                <span className="text-sm text-slate-300 flex-1">{spot.name}</span>
                <span className="text-sm text-slate-400">{spot.area}</span>
                <span className="text-sm font-medium text-indigo-300">{spot.usageCount}次</span>
              </div>
            ))}
            {stats.popularSpots.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">暂无使用数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-red-400" />
            遗落物品记录
          </h3>
          {stats.leftItemsReports.length > 0 ? (
            <div className="space-y-2">
              {stats.leftItemsReports.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{r.employeeName}</span>
                    <span className="text-xs text-slate-500">{r.date}</span>
                  </div>
                  {r.leftItemsDesc && (
                    <p className="text-xs text-red-300 mt-1">遗落：{r.leftItemsDesc}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-sm py-8">暂无遗落物品记录 ✨</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            未整理记录
          </h3>
          {stats.notCleanedReports.length > 0 ? (
            <div className="space-y-2">
              {stats.notCleanedReports.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{r.employeeName}</span>
                    <span className="text-xs text-slate-500">{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-sm py-8">大家都自觉整理了 🎉</p>
          )}
        </div>
      </div>
    </div>
  )
}
