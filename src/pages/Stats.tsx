import { useMemo } from 'react'
import { TrendingUp, Wallet, BarChart3 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIZE_LABELS } from '@/types'

export default function Stats() {
  const stats = useStore((s) => s.getStats())

  const sortedSizeDemand = useMemo(() => {
    return [...stats.sizeDemand].sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply))
  }, [stats.sizeDemand])

  const maxDemand = useMemo(() => {
    return Math.max(...sortedSizeDemand.map((s) => s.demand), 1)
  }, [sortedSizeDemand])

  const maxMonthlyCount = useMemo(() => {
    return Math.max(...stats.monthlyTrend.map((m) => m.count), 1)
  }, [stats.monthlyTrend])

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">流转统计</h1>
        <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">
          2026春季学期
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-200">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={16} className="opacity-80" />
            <span className="text-xs opacity-80">本学期流转</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold animate-count-up">{stats.totalTransferred}</span>
            <span className="text-sm opacity-70">件</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet size={16} className="opacity-80" />
            <span className="text-xs opacity-80">累计节省</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold animate-count-up">{stats.totalSaved}</span>
            <span className="text-sm opacity-70">元</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-orange-500" />
          <h2 className="text-base font-bold text-gray-800">尺码紧缺排行</h2>
        </div>
        {sortedSizeDemand.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无数据</div>
        ) : (
          <div className="space-y-3">
            {sortedSizeDemand.map((item) => {
              const isScarce = item.demand > item.supply
              const demandWidth = (item.demand / maxDemand) * 100
              const supplyWidth = (item.supply / maxDemand) * 100
              return (
                <div key={item.size}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-700">
                        {SIZE_LABELS[item.size] || item.size}
                      </span>
                      {isScarce && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>需求 <b className="text-red-500">{item.demand}</b></span>
                      <span>供应 <b className="text-emerald-500">{item.supply}</b></span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                        style={{ width: `${demandWidth}%` }}
                      />
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 transition-all duration-500"
                        style={{ width: `${supplyWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-red-400 to-orange-400" />
            <span>需求</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-emerald-300 to-emerald-500" />
            <span>供应</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>紧缺</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-orange-500" />
          <h2 className="text-base font-bold text-gray-800">流转趋势</h2>
        </div>
        {stats.monthlyTrend.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无数据</div>
        ) : (
          <div className="flex items-end justify-around gap-2 h-40">
            {stats.monthlyTrend.map((item) => {
              const barHeight = (item.count / maxMonthlyCount) * 100
              const monthLabel = item.month.slice(5)
              return (
                <div key={item.month} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs font-bold text-gray-700">{item.count}</span>
                  <div className="w-full max-w-[32px] relative" style={{ height: '100px' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-md transition-all duration-500"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{monthLabel}月</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
