import { useNavigate } from 'react-router-dom'
import { Bus, ArrowRight, Users, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ShuttleRoute } from '@/types'

interface RouteCardProps {
  route: ShuttleRoute
  remainingSeats: number
  waitlistCount: number
}

function getSeatColor(remaining: number, total: number) {
  const pct = remaining / total
  if (pct > 0.5) return 'bg-emerald-500'
  if (pct >= 0.2) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getSeatTextColor(remaining: number, total: number) {
  const pct = remaining / total
  if (pct > 0.5) return 'text-emerald-600'
  if (pct >= 0.2) return 'text-yellow-600'
  return 'text-red-600'
}

export default function RouteCard({ route, remainingSeats, waitlistCount }: RouteCardProps) {
  const navigate = useNavigate()
  const seatColor = getSeatColor(remainingSeats, route.totalSeats)
  const seatTextColor = getSeatTextColor(remainingSeats, route.totalSeats)
  const seatPct = Math.round(((route.totalSeats - remainingSeats) / route.totalSeats) * 100)

  return (
    <button
      onClick={() => navigate(`/route/${route.id}`)}
      className="w-full rounded-xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900">
              {route.name}
            </span>
            {route.isDelayed && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                晚点
              </span>
            )}
            {route.isTemporary && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                临时
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="truncate">{route.departure}</span>
            <ArrowRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span className="truncate">{route.destination}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[#1e3a5f]">
            <Clock className="h-4 w-4" />
            <span className="text-lg font-bold tabular-nums">{route.departureTime}</span>
          </div>
          {waitlistCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
              <Users className="h-3 w-3" />
              候补{waitlistCount}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-gray-500">
            <Bus className="h-3 w-3" />
            <span>
              余 <span className={cn('font-semibold', seatTextColor)}>{remainingSeats}</span> / {route.totalSeats} 座
            </span>
          </div>
          <span className="text-gray-400">{seatPct}% 已预约</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn('h-full rounded-full transition-all', seatColor)}
            style={{ width: `${seatPct}%` }}
          />
        </div>
      </div>
    </button>
  )
}
