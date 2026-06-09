import { BarChart3, TrendingUp, AlertTriangle, Users, MapPin, Activity } from 'lucide-react'
import { useRouteStore } from '@/stores/useRouteStore'
import { useReservationStore } from '@/stores/useReservationStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useAppStore } from '@/stores/useAppStore'

function getOccupancyColor(rate: number) {
  if (rate > 85) return 'bg-red-500'
  if (rate >= 60) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

function getOccupancyTextColor(rate: number) {
  if (rate > 85) return 'text-red-600'
  if (rate >= 60) return 'text-yellow-600'
  return 'text-emerald-600'
}

function getHeatColor(count: number, max: number) {
  if (max === 0) return 'bg-yellow-50'
  const ratio = count / max
  if (ratio > 0.8) return 'bg-orange-600'
  if (ratio > 0.6) return 'bg-orange-500'
  if (ratio > 0.4) return 'bg-orange-400'
  if (ratio > 0.2) return 'bg-orange-300'
  return 'bg-yellow-200'
}

export default function Stats() {
  const { routes, getTodayRoutes } = useRouteStore()
  const { reservations, getConfirmedByRoute, getOccupiedSeats } = useReservationStore()
  const { employees, getMonthlyNoShows, getMonthlyLateCancels } = useEmployeeStore()
  const { selectedDate } = useAppStore()

  const todayRoutes = getTodayRoutes(selectedDate)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const monthlyNoShows = getMonthlyNoShows(currentYear, currentMonth)
  const monthlyLateCancels = getMonthlyLateCancels(currentYear, currentMonth)

  const routeOccupancy = todayRoutes.map((route) => {
    const confirmed = getConfirmedByRoute(route.id)
    const occupied = getOccupiedSeats(route.id)
    const occupancyRate = route.totalSeats > 0 ? (occupied / route.totalSeats) * 100 : 0
    return { route, confirmedCount: confirmed.length, occupiedSeats: occupied, occupancyRate }
  }).sort((a, b) => b.occupancyRate - a.occupancyRate)

  const stopWaitlist: Record<string, { name: string; count: number }> = {}
  for (const route of routes) {
    for (const stop of route.stops) {
      if (!stopWaitlist[stop.id]) {
        stopWaitlist[stop.id] = { name: stop.name, count: 0 }
      }
    }
  }
  for (const res of reservations) {
    if (res.isWaitlisted && res.status !== 'cancelled') {
      const matchingStop = Object.entries(stopWaitlist).find(
        ([, val]) => val.name === res.boardingStop
      )
      if (matchingStop) {
        stopWaitlist[matchingStop[0]].count += 1
      }
    }
  }
  const stopWaitlistSorted = Object.values(stopWaitlist)
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
  const maxWaitlistCount = stopWaitlistSorted.length > 0 ? stopWaitlistSorted[0].count : 1

  const todayOccupiedSeats = todayRoutes.reduce(
    (sum, route) => sum + getOccupiedSeats(route.id), 0
  )

  const avgOccupancy =
    routeOccupancy.length > 0
      ? routeOccupancy.reduce((sum, ro) => sum + ro.occupancyRate, 0) / routeOccupancy.length
      : 0

  const noShowByEmployee: Record<string, { name: string; department: string; count: number }> = {}
  for (const record of monthlyNoShows) {
    const emp = employees.find((e) => e.id === record.employeeId)
    if (emp) {
      if (!noShowByEmployee[record.employeeId]) {
        noShowByEmployee[record.employeeId] = { name: emp.name, department: emp.department, count: 0 }
      }
      noShowByEmployee[record.employeeId].count += 1
    }
  }
  const noShowRanking = Object.values(noShowByEmployee).sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          数据统计
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-xs text-slate-500">今日线路</span>
            </div>
            <p className="text-2xl font-bold text-[#1e3a5f]">{todayRoutes.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-xs text-slate-500">已占座位</span>
            </div>
            <p className="text-2xl font-bold text-[#1e3a5f]">{todayOccupiedSeats}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-xs text-slate-500">本月爽约</span>
            </div>
            <p className="text-2xl font-bold text-[#1e3a5f]">{monthlyNoShows.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-xs text-slate-500">平均上座率</span>
            </div>
            <p className="text-2xl font-bold text-[#1e3a5f]">{avgOccupancy.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#ff6b35]" />
            线路拥挤度排名
          </h2>
          <div className="space-y-3">
            {routeOccupancy.map(({ route, occupiedSeats, occupancyRate }) => (
              <div key={route.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{route.name}</span>
                    <span className="text-xs text-slate-400">{route.departureTime}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getOccupancyTextColor(occupancyRate)}`}>
                    {occupancyRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getOccupancyColor(occupancyRate)}`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right">
                    {occupiedSeats}/{route.totalSeats}
                  </span>
                </div>
              </div>
            ))}
            {routeOccupancy.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">暂无今日线路数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ff6b35]" />
            站点候补热力
          </h2>
          <div className="space-y-2">
            {stopWaitlistSorted.map((stop) => (
              <div key={stop.name} className="flex items-center gap-3">
                <div
                  className={`${getHeatColor(stop.count, maxWaitlistCount)} rounded-md px-3 py-1.5 min-w-[60px] text-center`}
                >
                  <span className="text-sm font-bold text-white">{stop.count}</span>
                </div>
                <span className="text-sm text-slate-700">{stop.name}</span>
              </div>
            ))}
            {stopWaitlistSorted.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">暂无候补数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff6b35]" />
            月度爽约统计
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-3xl font-bold text-red-600">{monthlyNoShows.length}</p>
              <p className="text-xs text-red-400 mt-1">爽约次数</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-3xl font-bold text-yellow-600">{monthlyLateCancels.length}</p>
              <p className="text-xs text-yellow-400 mt-1">临取消次数</p>
            </div>
          </div>

          {noShowRanking.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">员工爽约排行</h3>
              <div className="space-y-2">
                {noShowRanking.map((emp, idx) => (
                  <div
                    key={emp.name}
                    className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-red-400' : idx === 2 ? 'bg-red-300' : 'bg-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm text-slate-700">{emp.name}</span>
                      <span className="text-xs text-slate-400">{emp.department}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-500">{emp.count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {noShowRanking.length === 0 && monthlyNoShows.length === 0 && monthlyLateCancels.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">本月暂无爽约记录</p>
          )}
        </div>
      </div>
    </div>
  )
}
