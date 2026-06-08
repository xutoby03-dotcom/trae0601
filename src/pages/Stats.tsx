import { useEffect } from 'react'
import { Package, ShoppingCart, Home, PieChart } from 'lucide-react'
import { useStore } from '@/store/useStore'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-8 w-20 bg-carbon-100 rounded" />
          <div className="h-4 w-14 bg-carbon-100 rounded" />
        </div>
        <div className="h-10 w-10 bg-carbon-100 rounded" />
      </div>
    </div>
  )
}

function SkeletonBar() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-12 bg-carbon-100 rounded" />
          <div className="flex-1 h-6 bg-carbon-100 rounded" />
          <div className="h-4 w-20 bg-carbon-100 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function Stats() {
  const { stats, fetchStats } = useStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!stats) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-6 w-32 bg-carbon-100 rounded mb-6 animate-pulse" />
          <SkeletonBar />
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...stats.categoryBreakdown.map((c) => c.value), 1)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-bold text-brand-500">{stats.totalListedCount}</p>
              <p className="text-sm text-carbon-400 mt-1">挂售中 · ¥{stats.totalListedValue.toLocaleString()}</p>
            </div>
            <Package className="w-10 h-10 text-carbon-200" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-bold text-brand-500">{stats.totalSoldCount}</p>
              <p className="text-sm text-carbon-400 mt-1">已售出 · ¥{stats.totalSoldValue.toLocaleString()}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-carbon-200" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-bold text-brand-500">{stats.recycledSpaceEstimate}</p>
              <p className="text-sm text-carbon-400 mt-1">回收空间 m³</p>
            </div>
            <Home className="w-10 h-10 text-carbon-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-carbon-700">
          <PieChart className="w-5 h-5 text-brand-500" />
          品类分布
        </h2>
        <div className="space-y-3">
          {stats.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="flex items-center gap-4">
              <span className="w-12 text-sm text-carbon-600 shrink-0">{cat.category}</span>
              <div className="flex-1 h-6 bg-carbon-50 rounded overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded"
                  style={{ width: `${(cat.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm text-carbon-500 shrink-0 w-24 text-right">
                {cat.count}件 · ¥{cat.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-carbon-400 pt-2">
          共 {stats.categoryBreakdown.reduce((s, c) => s + c.count, 0)} 件闲置物品，总价值 ¥
          {stats.categoryBreakdown.reduce((s, c) => s + c.value, 0).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
