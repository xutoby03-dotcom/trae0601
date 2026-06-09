import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useActivityStore } from '@/stores/useActivityStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { useRunnerStore } from '@/stores/useRunnerStore'
import { formatPace, formatTime, formatDate, getRouteTypeLabel } from '@/utils/helpers'
import { Clock, MapPin, Gauge, Ruler, Footprints } from 'lucide-react'

export default function MyRuns() {
  const navigate = useNavigate()
  const { currentRunner } = useRunnerStore()
  const { activities, participations, getActivityParticipations } = useActivityStore()
  const { getRoute } = useRouteStore()

  const myActivities = useMemo(() => {
    if (!currentRunner) return []
    const myParticipations = participations.filter(p => p.runnerId === currentRunner.id)
    const activityIds = new Set(myParticipations.map(p => p.activityId))
    return activities
      .filter(a => activityIds.has(a.id) || a.organizerId === currentRunner.id)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [currentRunner, activities, participations])

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { upcoming: '即将开始', ongoing: '进行中', completed: '已完成' }
    return map[status] || status
  }

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      upcoming: 'bg-green-500/20 text-green-300 border-green-500/30',
      ongoing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return map[status] || ''
  }

  if (!currentRunner) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <p className="text-gray-500">请先登录</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pb-20">
      <header className="px-5 pt-14 pb-4">
        <p className="text-sm text-[#00FF88]/70 font-medium">{currentRunner.avatar} {currentRunner.nickname}</p>
        <h1 className="text-2xl font-bold mt-1 tracking-tight">我的夜跑</h1>
      </header>

      <section className="px-5">
        {myActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Footprints size={40} className="mb-3 opacity-30" />
            <p className="text-sm">还没有参加过夜跑</p>
            <button
              onClick={() => navigate('/')}
              className="mt-3 text-sm text-[#00FF88] hover:underline"
            >
              去看看有哪些活动
            </button>
          </div>
        )}

        <div className="space-y-3">
          {myActivities.map(activity => {
            const route = getRoute(activity.routeId)
            if (!route) return null
            const parts = getActivityParticipations(activity.id)
            const isOrganizer = activity.organizerId === currentRunner.id

            return (
              <div
                key={activity.id}
                onClick={() => navigate(`/activity/${activity.id}`)}
                className="cursor-pointer rounded-xl border-l-4 bg-[#0d1525]/80 border border-white/5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(100,200,255,0.1)]"
                style={{ borderLeftColor: route.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{route.name}</h3>
                    {isOrganizer && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF88]/15 text-[#00FF88]">发起人</span>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusStyle(activity.status)}`}>
                    {getStatusLabel(activity.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{activity.startPoint}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span className="text-white">{formatDate(activity.startTime)} {formatTime(activity.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge size={12} />
                    <span className="text-white">{formatPace(activity.expectedPace)}/km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler size={12} />
                    <span className="text-white">{activity.expectedDistance}km</span>
                  </div>
                </div>

                {activity.status === 'completed' && isOrganizer && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/record/${activity.id}`) }}
                    className="mt-3 w-full rounded-lg bg-cyan-500/15 border border-cyan-500/20 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/25"
                  >
                    记录结果
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Navbar />
    </div>
  )
}
