import { useEffect, useState } from 'react'
import { Package, ShoppingCart, Home, PieChart, Table2 } from 'lucide-react'
import { useStore } from '@/store/useStore'

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'selling', label: '在售' },
  { key: 'sold', label: '已售' },
] as const

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

function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-full bg-carbon-100 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 w-full bg-carbon-50 rounded" />
      ))}
    </div>
  )
}

export default function Stats() {
  const { statsMap, statsLoadingMap, fetchStats } = useStore()
  const [activeStatus, setActiveStatus] = useState('')

  useEffect(() => {
    fetchStats(activeStatus || undefined)
  }, [activeStatus, fetchStats])

  const cacheKey = activeStatus || 'all'
  const stats = statsMap[cacheKey]
  const loading = statsLoadingMap[cacheKey] && !stats

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatus(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeStatus === tab.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-carbon-400 hover:text-carbon-600 border border-carbon-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-6 w-32 bg-carbon-100 rounded mb-6 animate-pulse" />
            <SkeletonTable />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-6 w-32 bg-carbon-100 rounded mb-6 animate-pulse" />
            <SkeletonBar />
          </div>
        </>
      ) : stats ? (
        <>
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

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-carbon-700 mb-5">
              <Table2 className="w-5 h-5 text-brand-500" />
              分类明细
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-carbon-100">
                    <th className="text-left py-3 px-4 text-carbon-400 font-medium">分类</th>
                    <th className="text-right py-3 px-4 text-carbon-400 font-medium">挂售件数</th>
                    <th className="text-right py-3 px-4 text-carbon-400 font-medium">挂售金额</th>
                    <th className="text-right py-3 px-4 text-carbon-400 font-medium">已售件数</th>
                    <th className="text-right py-3 px-4 text-carbon-400 font-medium">已售金额</th>
                    <th className="text-right py-3 px-4 text-carbon-400 font-medium">回收空间</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categoryDetails.map((cat) => (
                    <tr key={cat.category} className="border-b border-carbon-50 hover:bg-carbon-50/50 transition">
                      <td className="py-3 px-4 font-medium text-carbon-700">{cat.category}</td>
                      <td className="py-3 px-4 text-right text-carbon-600">{cat.listedCount}</td>
                      <td className="py-3 px-4 text-right text-carbon-600">¥{cat.listedValue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-carbon-600">{cat.soldCount}</td>
                      <td className="py-3 px-4 text-right text-carbon-600">¥{cat.soldValue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-carbon-600">{cat.spaceEstimate} m³</td>
                    </tr>
                  ))}
                  <tr className="bg-carbon-50/50 font-semibold text-carbon-700">
                    <td className="py-3 px-4">合计</td>
                    <td className="py-3 px-4 text-right">{stats.totalListedCount}</td>
                    <td className="py-3 px-4 text-right">¥{stats.totalListedValue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{stats.totalSoldCount}</td>
                    <td className="py-3 px-4 text-right">¥{stats.totalSoldValue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{stats.recycledSpaceEstimate} m³</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-carbon-700">
              <PieChart className="w-5 h-5 text-brand-500" />
              品类分布
            </h2>
            {(() => {
              const maxValue = Math.max(...stats.categoryBreakdown.map((c) => c.value), 1)
              return (
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
              )
            })()}
            <p className="text-sm text-carbon-400 pt-2">
              共 {stats.categoryBreakdown.reduce((s, c) => s + c.count, 0)} 件闲置物品，总价值 ¥
              {stats.categoryBreakdown.reduce((s, c) => s + c.value, 0).toLocaleString()}
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
