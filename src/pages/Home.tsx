import { Bus, Calendar, AlertTriangle, User } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { useReservationStore } from '@/stores/useReservationStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import RouteCard from '@/components/RouteCard'
import { cn } from '@/lib/utils'
import type { TabType, ShuttleRoute } from '@/types'

const tabs: { key: TabType; label: string }[] = [
  { key: 'morning', label: '早班' },
  { key: 'evening', label: '晚班' },
  { key: 'soon', label: '快发车' },
]

function isDepartingWithin30Minutes(route: ShuttleRoute): boolean {
  const now = new Date()
  const [h, m] = route.departureTime.split(':').map(Number)
  const departure = new Date(route.date)
  departure.setHours(h, m, 0, 0)
  const diff = departure.getTime() - now.getTime()
  return diff > 0 && diff <= 30 * 60 * 1000
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
}

export default function Home() {
  const { activeTab, setActiveTab, selectedDate } = useAppStore()
  const { getTodayRoutes } = useRouteStore()
  const { getRemainingSeats, getWaitlistByRoute } = useReservationStore()
  const { getCurrentEmployee, isEmployeeBanned } = useEmployeeStore()

  const todayRoutes = getTodayRoutes(selectedDate)
  const employee = getCurrentEmployee()
  const banned = employee ? isEmployeeBanned(employee.id) : false

  const morningRoutes = todayRoutes
    .filter((r) => r.type === 'morning')
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime))

  const eveningRoutes = todayRoutes
    .filter((r) => r.type === 'evening')
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime))

  const soonRoutes = todayRoutes
    .filter(isDepartingWithin30Minutes)
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime))

  const routeMap: Record<TabType, ShuttleRoute[]> = {
    morning: morningRoutes,
    evening: eveningRoutes,
    soon: soonRoutes,
  }

  const currentRoutes = routeMap[activeTab]

  const tabCounts: Record<TabType, number> = {
    morning: morningRoutes.length,
    evening: eveningRoutes.length,
    soon: soonRoutes.length,
  }

  return (
    <div className="space-y-4 pb-6">
      {employee && (
        <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f]">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
              <div className="text-[11px] text-gray-400">{employee.department}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-400">信用分</div>
            <div className={cn(
              'text-sm font-bold',
              employee.creditScore >= 5 ? 'text-red-600' :
              employee.creditScore >= 3 ? 'text-yellow-600' :
              'text-emerald-600'
            )}>
              {employee.creditScore}
            </div>
          </div>
        </div>
      )}

      {banned && employee && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-red-700 ring-1 ring-red-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">账号已被封禁</span>
            {employee.banEndDate && (
              <span className="text-red-500">，解封日期：{employee.banEndDate}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(selectedDate)}</span>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-all',
              activeTab === tab.key
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span
                className={cn(
                  'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  activeTab === tab.key
                    ? 'bg-[#ff6b35] text-white'
                    : tab.key === 'soon'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {currentRoutes.length > 0 ? (
        <div className="space-y-3">
          {currentRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              remainingSeats={getRemainingSeats(route.id, route.totalSeats)}
              waitlistCount={getWaitlistByRoute(route.id).length}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-16 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Bus className="h-7 w-7 text-gray-300" />
          </div>
          <div className="text-sm text-gray-400">
            {activeTab === 'morning' && '暂无早班线路'}
            {activeTab === 'evening' && '暂无晚班线路'}
            {activeTab === 'soon' && '暂无即将发车的线路'}
          </div>
        </div>
      )}
    </div>
  )
}
