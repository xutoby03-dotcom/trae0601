import { useMemo } from 'react'
import { BarChart3, DollarSign, AlertTriangle, Clock, Wind, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'

export default function Stats() {
  const acUnits = useStore((s) => s.acUnits)
  const cleaningRecords = useStore((s) => s.cleaningRecords)

  const currentYear = new Date().getFullYear()

  const thisYearRecords = useMemo(
    () => cleaningRecords.filter((r) => new Date(r.cleanDate).getFullYear() === currentYear),
    [cleaningRecords, currentYear]
  )

  const yearTotalCost = useMemo(() => thisYearRecords.reduce((sum, r) => sum + r.cost, 0), [thisYearRecords])

  const costPerAC = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of thisYearRecords) {
      map.set(r.acId, (map.get(r.acId) || 0) + r.cost)
    }
    return acUnits
      .map((ac) => ({ id: ac.id, room: ac.room, cost: map.get(ac.id) || 0 }))
      .filter((item) => item.cost > 0)
      .sort((a, b) => b.cost - a.cost)
  }, [thisYearRecords, acUnits])

  const maxCost = costPerAC.length > 0 ? costPerAC[0].cost : 0

  const issueRanking = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of cleaningRecords) {
      if (r.hasOdor || r.hasLeakage) {
        map.set(r.acId, (map.get(r.acId) || 0) + 1)
      }
    }
    return acUnits
      .map((ac) => ({ id: ac.id, room: ac.room, count: map.get(ac.id) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [cleaningRecords, acUnits])

  const avgCleaningCycle = useMemo(() => {
    const cycles: number[] = []
    const perAC: { room: string; avg: number }[] = []

    for (const ac of acUnits) {
      const records = cleaningRecords
        .filter((r) => r.acId === ac.id)
        .map((r) => new Date(r.cleanDate).getTime())
        .sort((a, b) => a - b)

      if (records.length < 2) continue

      const acCycles: number[] = []
      for (let i = 1; i < records.length; i++) {
        const days = Math.round((records[i] - records[i - 1]) / (1000 * 60 * 60 * 24))
        acCycles.push(days)
        cycles.push(days)
      }

      const acAvg = acCycles.reduce((s, d) => s + d, 0) / acCycles.length
      perAC.push({ room: ac.room, avg: Math.round(acAvg) })
    }

    const overall = cycles.length > 0 ? Math.round(cycles.reduce((s, d) => s + d, 0) / cycles.length) : 0

    return { overall, perAC: perAC.sort((a, b) => b.avg - a.avg) }
  }, [cleaningRecords, acUnits])

  const thisYearCleanCount = thisYearRecords.length

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-orange-500" />
        统计概览
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            年度清洗费用
          </div>
          <div className="text-3xl font-bold text-orange-700">¥{yearTotalCost.toLocaleString()}</div>
          <div className="text-xs text-orange-500 mt-1">{currentYear}年</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
            <Wind className="w-4 h-4" />
            空调总数
          </div>
          <div className="text-3xl font-bold text-amber-700">{acUnits.length}</div>
          <div className="text-xs text-amber-500 mt-1">台</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-600 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            今年清洗次数
          </div>
          <div className="text-3xl font-bold text-yellow-700">{thisYearCleanCount}</div>
          <div className="text-xs text-yellow-500 mt-1">{currentYear}年</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-orange-500" />
          各空调费用对比
        </h2>
        {costPerAC.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无数据</p>
        ) : (
          <div className="space-y-3">
            {costPerAC.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.room}</span>
                  <span className="text-orange-600 font-medium">¥{item.cost.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: maxCost > 0 ? `${(item.cost / maxCost) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          问题频次排名
        </h2>
        {issueRanking.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无问题记录</p>
        ) : (
          <div className="space-y-2">
            {issueRanking.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  idx === 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                      idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-400' : idx === 2 ? 'bg-amber-400' : 'bg-gray-400'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-800">{item.room}</span>
                </div>
                <span className={cn('text-sm font-medium', idx === 0 ? 'text-red-600' : 'text-gray-600')}>
                  {item.count} 次
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          平均清洗周期
        </h2>
        {avgCleaningCycle.overall === 0 ? (
          <p className="text-gray-400 text-sm">数据不足，至少需要每台空调有2条清洗记录</p>
        ) : (
          <>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-4 border border-orange-200">
              <div className="text-sm text-orange-600 mb-1">全局平均周期</div>
              <div className="text-2xl font-bold text-orange-700">{avgCleaningCycle.overall} 天</div>
            </div>
            <div className="space-y-2">
              {avgCleaningCycle.perAC.map((item) => (
                <div key={item.room} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{item.room}</span>
                  <span className="text-sm font-medium text-orange-600">{item.avg} 天</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
