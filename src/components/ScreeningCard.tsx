import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { useCinemaStore } from '@/store'
import type { Screening } from '@/types'

interface ScreeningCardProps {
  screening: Screening
  index: number
}

export default function ScreeningCard({ screening, index }: ScreeningCardProps) {
  const getConfirmedCount = useCinemaStore((s) => s.getConfirmedCount)
  const getWaitlisted = useCinemaStore((s) => s.getWaitlisted)
  const confirmedCount = getConfirmedCount(screening.id)
  const waitlistCount = getWaitlisted(screening.id).length
  const seatPercent = Math.min(100, Math.round((confirmedCount / screening.seatLimit) * 100))
  const isFull = confirmedCount >= screening.seatLimit

  const statusColors: Record<string, string> = {
    upcoming: 'bg-green-100 text-green-700',
    ongoing: 'bg-orange/10 text-orange',
    completed: 'bg-night-lighter/10 text-night-lighter',
    rained_out: 'bg-blue-100 text-blue-700',
  }

  const statusLabels: Record<string, string> = {
    upcoming: '即将放映',
    ongoing: '放映中',
    completed: '已结束',
    rained_out: '因雨改期',
  }

  return (
    <Link
      to={`/screening/${screening.id}`}
      className={`card group overflow-hidden animate-slide-up opacity-0 stagger-${Math.min(index + 1, 4)}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={screening.posterUrl}
          alt={screening.movieName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="poster-overlay absolute inset-0" />
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[screening.status]}`}>
            {statusLabels[screening.status]}
          </span>
        </div>
        {screening.isRescheduled && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              已改期
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-xl font-bold text-white mb-1 drop-shadow-lg">
            {screening.movieName}
          </h3>
          <div className="flex items-center gap-1 text-cream/80 text-sm">
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-xs backdrop-blur-sm">
              {screening.ageRating}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-night-lighter">
            <Calendar className="w-4 h-4 text-orange" />
            <span>{screening.date} 周五 19:30</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-night-lighter">
            <MapPin className="w-4 h-4 text-orange" />
            <span>{screening.location}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-night-lighter">
              <Users className="w-4 h-4 text-orange" />
              <span>座位</span>
            </div>
            <span className={`font-medium ${isFull ? 'text-red-500' : 'text-night'}`}>
              {confirmedCount}/{screening.seatLimit}
            </span>
          </div>
          <div className="h-2 bg-night-lighter/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-600 ${
                isFull ? 'bg-red-400' : 'bg-gradient-to-r from-orange to-gold'
              }`}
              style={{ width: `${seatPercent}%` }}
            />
          </div>
        </div>

        {waitlistCount > 0 && (
          <div className="text-xs text-orange bg-orange/5 rounded-lg px-3 py-1.5 text-center">
            {waitlistCount} 人在候补队列中
          </div>
        )}
      </div>
    </Link>
  )
}
