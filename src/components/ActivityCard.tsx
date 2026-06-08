import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign } from 'lucide-react'
import type { Activity } from '@/utils/api'
import Countdown from './Countdown'

const statusColors: Record<Activity['status'], string> = {
  not_started: 'bg-zinc-500/20 text-zinc-400',
  registering: 'bg-status/20 text-status',
  full: 'bg-urgent/20 text-urgent',
  ended: 'bg-zinc-600/20 text-zinc-500',
}

const statusLabels: Record<Activity['status'], string> = {
  not_started: '未开始',
  registering: '报名中',
  full: '已满员',
  ended: '已结束',
}

const gradients = [
  'from-accent/60 to-urgent/60',
  'from-status/60 to-accent/60',
  'from-urgent/60 to-status/60',
  'from-accent/60 to-status/60',
]

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityCard({ activity, index = 0 }: { activity: Activity; index?: number }) {
  const confirmed = activity.confirmedCount ?? 0
  const remaining = Math.max(activity.maxParticipants - confirmed, 0)
  const progress = Math.min((confirmed / activity.maxParticipants) * 100, 100)
  const gradient = gradients[index % gradients.length]

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="group block overflow-hidden rounded-xl border border-dark-border bg-dark-surface transition-all hover:border-dark-hover hover:shadow-lg hover:shadow-accent/5"
    >
      <div className={`h-28 relative overflow-hidden ${activity.poster ? '' : `bg-gradient-to-br ${gradient}`}`}>
        {activity.poster && (
          <img src={activity.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {activity.poster && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
        <span className={`absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${statusColors[activity.status]}`}>
          {statusLabels[activity.status]}
        </span>
        {activity.type && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white/90 backdrop-blur-sm">
            {activity.type}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-base font-semibold text-white group-hover:text-accent transition-colors line-clamp-1">
          {activity.title}
        </h3>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatTime(activity.startTime)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {activity.cost > 0 ? (
            <div className="flex items-center gap-1 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-accent" />
              <span className="font-medium text-accent">¥{activity.cost}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-success">免费</span>
          )}
          {activity.status !== 'ended' && activity.status !== 'full' && (
            <Countdown targetTime={activity.startTime} />
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              剩余 <span className={remaining <= 3 ? 'text-urgent font-medium' : 'text-status font-medium'}>{remaining}</span> / {activity.maxParticipants}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-dark-hover">
            <div
              className="h-full rounded-full bg-status transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
