import { useUmbrellaStore } from '@/store'
import { formatDuration } from '@/utils/helpers'
import { MapPin, TrendingDown, Clock, Trophy, Umbrella } from 'lucide-react'
import { motion } from 'framer-motion'

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  delay,
}: {
  icon: typeof MapPin
  label: string
  value: string | number
  unit?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200/60 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-800 font-display">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const store = useUmbrellaStore()

  const locationStats = store.getLocationStats().sort((a, b) => a.available - b.available)
  const contributorStats = store.getContributorStats()
  const lossRate = store.getLossRate()
  const avgDuration = store.getAverageBorrowDuration()
  const totalUmbrellas = store.umbrellas.length
  const totalBorrowed = store.borrowRecords.length

  const maxLocationTotal = Math.max(...locationStats.map((l) => l.total), 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C] font-display">共享统计</h2>
        <p className="text-sm text-slate-400 mt-1">社区雨伞共享数据一览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Umbrella}
          label="雨伞总数"
          value={totalUmbrellas}
          unit="把"
          color="bg-[#1B3A5C]"
          delay={0}
        />
        <StatCard
          icon={TrendingDown}
          label="丢失率"
          value={lossRate}
          unit="%"
          color="bg-red-500"
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          label="平均借用时长"
          value={avgDuration > 0 ? formatDuration(avgDuration) : '—'}
          color="bg-blue-500"
          delay={0.2}
        />
        <StatCard
          icon={Trophy}
          label="借用总次数"
          value={totalBorrowed}
          unit="次"
          color="bg-amber-500"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-[#1B3A5C]" />
          <h3 className="text-sm font-bold text-slate-800">放置点缺伞排行</h3>
        </div>
        <div className="space-y-3">
          {locationStats.map((loc) => (
            <div key={loc.location}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">{loc.location}</span>
                <span className="text-xs text-slate-400">
                  可借 <span className={loc.available === 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-semibold'}>{loc.available}</span> / {loc.total}
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${(loc.available / maxLocationTotal) * 100}%` }}
                />
                <div
                  className="h-full bg-slate-300 transition-all duration-700"
                  style={{ width: `${((loc.total - loc.available) / maxLocationTotal) * 100}%` }}
                />
              </div>
              {loc.available === 0 && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-semibold">
                  缺伞！
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">贡献排行榜</h3>
        </div>
        <div className="space-y-2">
          {contributorStats.map((contributor, index) => (
            <div
              key={contributor.name}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-amber-100 text-amber-700'
                    : index === 1
                    ? 'bg-slate-200 text-slate-600'
                    : index === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {index + 1}
              </div>
              <span className="flex-1 text-sm font-medium text-slate-700">{contributor.name}</span>
              <span className="text-sm font-bold text-[#1B3A5C]">{contributor.count}</span>
              <span className="text-xs text-slate-400">把</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
