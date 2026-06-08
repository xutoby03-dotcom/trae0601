import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarpoolStore } from '@/store/useCarpoolStore'
import RouteCard from '@/components/RouteCard'
import StatusBadge from '@/components/StatusBadge'
import { formatFullDate } from '@/utils/time'
import { formatCurrency, calculateCostPerPerson } from '@/utils/cost'
import type { FrequentRoute } from '@/types'
import { History as HistoryIcon, Route, ArrowRight, Car } from 'lucide-react'

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function History() {
  const navigate = useNavigate()
  const carpools = useCarpoolStore((s) => s.carpools)

  const sortedHistorical = useMemo(() => {
    return carpools
      .filter((c) => c.status === 'departed' || c.status === 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [carpools])

  const frequentRoutes = useMemo(() => {
    const departed = carpools.filter((c) => c.status === 'departed')
    const routeMap = new Map<string, FrequentRoute & { totalCostSum: number }>()
    departed.forEach((c) => {
      const key = `${c.departure}→${c.destination}`
      const existing = routeMap.get(key)
      if (existing) {
        existing.count++
        existing.totalCostSum += c.totalCost
        if (c.createdAt > existing.lastUsed) existing.lastUsed = c.createdAt
      } else {
        routeMap.set(key, {
          id: generateId(),
          departure: c.departure,
          destination: c.destination,
          count: 1,
          avgCost: c.totalCost,
          totalCostSum: c.totalCost,
          lastUsed: c.createdAt,
        })
      }
    })
    return Array.from(routeMap.values())
      .map(({ totalCostSum, ...rest }) => ({ ...rest, avgCost: Math.round(totalCostSum / rest.count) }))
      .filter((r) => r.count >= 2)
      .sort((a, b) => b.count - a.count)
  }, [carpools])

  const handleRepublish = (departure: string, destination: string, avgCost: number) => {
    const params = new URLSearchParams({ departure, destination, totalCost: String(avgCost) })
    navigate(`/publish?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">历史记录</h1>
        <p className="text-sm text-slate-400 mt-0.5">已完成的拼车与常用路线</p>
      </div>

      {frequentRoutes.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-bold text-slate-700 text-base mb-3">
            <Route className="w-5 h-5 text-orange-500" />
            常用路线
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {frequentRoutes.map((route) => (
              <RouteCard key={route.id} route={route} onRepublish={handleRepublish} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="flex items-center gap-2 font-bold text-slate-700 text-base mb-3">
          <HistoryIcon className="w-5 h-5 text-orange-500" />
          已完成拼车
        </h2>

        {sortedHistorical.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Car className="w-8 h-8 text-orange-300" />
            </div>
            <p className="text-slate-400 text-sm">暂无历史拼车记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHistorical.map((carpool) => {
              const perPerson = calculateCostPerPerson(carpool.totalCost, Math.max(carpool.passengers.length, 1))
              return (
                <div
                  key={carpool.id}
                  onClick={() => navigate(`/carpool/${carpool.id}`)}
                  className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{carpool.departure}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-bold text-slate-700">{carpool.destination}</span>
                    </div>
                    <StatusBadge status={carpool.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{formatFullDate(carpool.departureTime)}</span>
                    <span>{carpool.passengers.length}人参与</span>
                    <span className="font-medium text-orange-600">{formatCurrency(perPerson)}/人</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
