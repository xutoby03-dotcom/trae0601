import { Link } from 'react-router-dom'
import type { Carpool } from '@/types'
import StatusBadge from './StatusBadge'
import SeatIndicator from './SeatIndicator'
import { formatDepartureTime, formatFullDate } from '@/utils/time'
import { formatCurrency, calculateCostPerPerson } from '@/utils/cost'
import { MapPin, Clock, Luggage, Phone, Users } from 'lucide-react'

interface CarpoolCardProps {
  carpool: Carpool
}

export default function CarpoolCard({ carpool }: CarpoolCardProps) {
  const remaining = carpool.totalSeats - carpool.passengers.length
  const perPerson = calculateCostPerPerson(carpool.totalCost, Math.max(carpool.passengers.length, 1))

  return (
    <Link
      to={`/carpool/${carpool.id}`}
      className="block bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden group"
    >
      <div className="flex">
        <div className={`w-1.5 flex-shrink-0 ${
          carpool.status === 'recruiting' ? 'bg-emerald-400' :
          carpool.status === 'full' ? 'bg-amber-400' :
          carpool.status === 'departed' ? 'bg-slate-300' : 'bg-red-400'
        }`} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-orange-700 transition-colors">
                  {carpool.destination}
                </h3>
                <StatusBadge status={carpool.status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{carpool.departure}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold text-lg">{formatDepartureTime(carpool.departureTime)}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatFullDate(carpool.departureTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{carpool.publisherName}</span>
            </div>
            {carpool.allowLuggage && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Luggage className="w-3.5 h-3.5" />
                <span>可带行李</span>
              </div>
            )}
            <div className="text-xs text-slate-500 ml-auto font-semibold">
              {formatCurrency(perPerson)}/人
            </div>
          </div>

          <SeatIndicator total={carpool.totalSeats} taken={carpool.passengers.length} />

          {carpool.messages.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-50">
              <p className="text-xs text-slate-400 truncate">
                💬 {carpool.messages[carpool.messages.length - 1].content}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
