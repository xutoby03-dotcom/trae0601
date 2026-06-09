import { useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import RouteMap from '@/components/RouteMap'
import SafetyBanner from '@/components/SafetyBanner'
import ActivityCard from '@/components/ActivityCard'
import Navbar from '@/components/Navbar'
import { useActivityStore } from '@/stores/useActivityStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { useRunnerStore } from '@/stores/useRunnerStore'
import type { SafetyAlert } from '@/types'
import { generateId } from '@/utils/helpers'
import { getRouteTypeLabel } from '@/utils/helpers'
import { ChevronDown, Zap } from 'lucide-react'

type RouteFilter = 'all' | 'track' | 'riverside' | 'street' | 'park'

export default function Home() {
  const navigate = useNavigate()
  const { activities, participations, getUpcomingActivities } = useActivityStore()
  const { routes, getRoute } = useRouteStore()
  const { runners } = useRunnerStore()

  const [highlightedRouteId, setHighlightedRouteId] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [routeFilter, setRouteFilter] = useState<RouteFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const activityListRef = useRef<HTMLDivElement>(null)

  const activeAlerts = useMemo<SafetyAlert[]>(() => {
    const alerts: SafetyAlert[] = []
    const hour = new Date().getHours()
    if (hour >= 22 || hour < 5) {
      alerts.push({
        id: generateId(),
        type: 'late_night',
        message: '深夜跑步提醒 — 请选择灯光明亮的路线',
        timestamp: new Date().toISOString(),
      })
    }
    if (Math.random() < 0.15) {
      alerts.push({
        id: generateId(),
        type: 'rain',
        message: '检测到降雨 — 注意路面湿滑',
        timestamp: new Date().toISOString(),
      })
    }
    return alerts
  }, [])

  const visibleAlerts = useMemo(
    () => activeAlerts.filter((a) => !dismissedAlerts.has(a.id)),
    [activeAlerts, dismissedAlerts]
  )

  const handleDismissAlert = useCallback((id: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(id))
  }, [])

  const upcomingActivities = useMemo(() => getUpcomingActivities(), [getUpcomingActivities, activities])

  const filteredActivities = useMemo(() => {
    if (routeFilter === 'all') return upcomingActivities
    return upcomingActivities.filter((a) => {
      const route = getRoute(a.routeId)
      return route?.type === routeFilter
    })
  }, [upcomingActivities, routeFilter, getRoute])

  const mapRoutes = useMemo(() => {
    const routeIds = new Set(filteredActivities.map((a) => a.routeId))
    return routes.filter((r) => routeIds.has(r.id))
  }, [filteredActivities, routes])

  const handleRouteClick = useCallback((routeId: string) => {
    setHighlightedRouteId((prev) => (prev === routeId ? null : routeId))

    const matchingIndex = filteredActivities.findIndex((a) => a.routeId === routeId)
    if (matchingIndex >= 0 && activityListRef.current) {
      const cardElements = activityListRef.current.querySelectorAll('[data-activity-id]')
      const target = cardElements[matchingIndex] as HTMLElement
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.add('ring-2', 'ring-[#00FF88]/60')
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-[#00FF88]/60')
        }, 2000)
      }
    }
  }, [filteredActivities])

  const handleActivityClick = useCallback((activityId: string) => {
    navigate(`/activity/${activityId}`)
  }, [navigate])

  const filterOptions: { value: RouteFilter; label: string }[] = [
    { value: 'all', label: '全部路线' },
    { value: 'track', label: '操场' },
    { value: 'riverside', label: '河道' },
    { value: 'street', label: '街道' },
    { value: 'park', label: '公园' },
  ]

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0B1120]">
      <div className="absolute inset-0 z-0">
        <RouteMap
          routes={mapRoutes}
          onRouteClick={handleRouteClick}
          highlightedRouteId={highlightedRouteId ?? undefined}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 z-20">
        <SafetyBanner alerts={visibleAlerts} onDismiss={handleDismissAlert} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col" style={{ height: '40%' }}>
        <div className="relative flex-shrink-0 rounded-t-2xl bg-[#0B1120]/85 backdrop-blur-xl border-t border-white/10">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-center justify-between px-5 pt-2 pb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-white tracking-wide">即将出发</h2>
              <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[#00FF88]/15 px-1.5 text-xs font-bold text-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.3)]">
                {filteredActivities.length}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 border border-white/5"
              >
                {routeFilter === 'all' ? '路线类型' : getRouteTypeLabel(routeFilter)}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-28 rounded-lg bg-[#131d33]/95 backdrop-blur-xl border border-white/10 py-1 shadow-xl shadow-black/40 z-50">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setRouteFilter(opt.value)
                        setFilterOpen(false)
                        setHighlightedRouteId(null)
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                        routeFilter === opt.value
                          ? 'text-[#00FF88] bg-[#00FF88]/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          ref={activityListRef}
          className="flex-1 overflow-y-auto bg-[#0B1120]/85 backdrop-blur-xl px-4 pb-20 scrollbar-thin scrollbar-thumb-white/10"
        >
          <div className="space-y-3 pt-1">
            {filteredActivities.map((activity) => {
              const route = getRoute(activity.routeId)
              if (!route) return null
              const activityParticipations = participations.filter(
                (p) => p.activityId === activity.id
              )
              return (
                <div
                  key={activity.id}
                  data-activity-id={activity.id}
                  className="rounded-xl transition-all duration-500"
                >
                  <ActivityCard
                    activity={activity}
                    route={route}
                    participations={activityParticipations}
                    runners={runners}
                    onActivityClick={handleActivityClick}
                  />
                </div>
              )
            })}
            {filteredActivities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">暂无符合条件的夜跑活动</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/create')}
        className="absolute bottom-20 right-5 z-30 flex items-center gap-2 rounded-full bg-[#00FF88] px-5 py-3 text-sm font-bold text-[#0B1120] shadow-[0_0_24px_rgba(0,255,136,0.5)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(0,255,136,0.7)] hover:scale-105 active:scale-95 animate-[neonPulse_2s_ease-in-out_infinite]"
      >
        <Zap size={18} strokeWidth={2.5} />
        发起夜跑
      </button>

      <div className="absolute bottom-0 left-0 right-0 z-40">
        <Navbar />
      </div>
    </div>
  )
}
