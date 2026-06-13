import { Truck } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function ExpressStats() {
  const { getDashboardStats } = useAppStore()
  const stats = getDashboardStats()
  const entries = Object.entries(stats.expressCounts)

  const maxCount = entries.length > 0 ? Math.max(...entries.map(([, c]) => c)) : 1

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Truck size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">快递公司分布</h3>
            <p className="text-sm text-slate-500">当前在柜各快递公司数量</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 py-6 text-center">暂无在柜包裹</p>
      </div>
    )
  }

  const colorMap = [
    'from-primary-400 to-primary-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-warning-400 to-warning-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-teal-400 to-teal-600',
    'from-slate-400 to-slate-600',
  ]

  return (
    <div className="bg-white rounded-2xl card-shadow p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Truck size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">快递公司分布</h3>
            <p className="text-sm text-slate-500">当前在柜各快递公司数量</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
          共 {stats.occupiedLockers} 件
        </span>
      </div>

      <div className="space-y-3">
        {entries.map(([company, count], idx) => {
          const pct = (count / maxCount) * 100
          return (
            <div key={company} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">{company}</span>
                <span className="text-sm font-bold text-slate-800">{count} 件</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorMap[idx % colorMap.length]} transition-all duration-500 group-hover:brightness-110`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
