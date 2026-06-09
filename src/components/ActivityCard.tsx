import { Clock, MapPin, Gauge, Route as RouteIcon, Users } from 'lucide-react'
import type { Activity, Route, Participation, Runner } from '@/types'
import { formatPace, formatTime, getTimeUntil, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

interface ActivityCardProps {
  activity: Activity
  route: Route
  participations: Participation[]
  runners: Runner[]
  onActivityClick: (activityId: string) => void
}

const statusConfig = {
  upcoming: { dot: 'bg-green-400', pulse: false },
  ongoing: { dot: 'bg-orange-400', pulse: true },
  completed: { dot: 'bg-gray-500', pulse: false },
}

export default function ActivityCard({
  activity,
  route,
  participations,
  runners,
  onActivityClick,
}: ActivityCardProps) {
  const { dot, pulse } = statusConfig[activity.status]
  const runnerMap = new Map(runners.map((r) => [r.id, r]))
  const participantRunners = participations
    .map((p) => runnerMap.get(p.runnerId))
    .filter(Boolean) as Runner[]

  return (
    <div
      onClick={() => onActivityClick(activity.id)}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl',
        'border-l-4 bg-[#0d1525]/80 backdrop-blur-xl',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(100,200,255,0.15)]',
        'hover:border-[rgba(100,200,255,0.3)]',
        'border border-white/5 p-4',
      )}
      style={{ borderLeftColor: route.color }}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:border group-hover:border-cyan-400/20" />

      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              {pulse && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              )}
              <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', dot)} />
            </div>
            <h3 className="text-base font-semibold text-white">{route.name}</h3>
          </div>
          {activity.acceptBeginner && (
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-300">
              接受新手
            </span>
          )}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5 text-gray-400">
            <RouteIcon size={14} className="text-cyan-400/60" />
            <span>{activity.startPoint}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={14} className="text-cyan-400/60" />
            <span className="text-white">
              {formatDate(activity.startTime)} {formatTime(activity.startTime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Gauge size={14} className="text-cyan-400/60" />
            <span className="text-white">{formatPace(activity.expectedPace)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin size={14} className="text-cyan-400/60" />
            <span className="text-white">{activity.expectedDistance}km</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {participantRunners.length > 0 && (
              <div className="flex -space-x-2">
                {participantRunners.slice(0, 5).map((runner) => (
                  <div
                    key={runner.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0d1525] bg-[#1a2744] text-sm"
                  >
                    {runner.avatar}
                  </div>
                ))}
                {participantRunners.length > 5 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0d1525] bg-[#1a2744] text-[10px] text-gray-400">
                    +{participantRunners.length - 5}
                  </div>
                )}
              </div>
            )}
            <span className="ml-2 flex items-center gap-1 text-xs text-gray-500">
              <Users size={12} />
              {participations.length}
            </span>
          </div>

          {activity.status !== 'completed' && (
            <span className="text-xs font-medium text-cyan-400/80">
              {getTimeUntil(activity.startTime)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
