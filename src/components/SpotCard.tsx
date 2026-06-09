import { MapPin, Car, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ParkingSpot } from '@/types'
import { VEHICLE_SIZE_LABELS, SPOT_STATUS_LABELS, formatDaySlots } from '@/store/useParkingStore'

interface SpotCardProps {
  spot: ParkingSpot
}

export default function SpotCard({ spot }: SpotCardProps) {
  const navigate = useNavigate()

  const statusColor = {
    available: 'bg-emerald-100 text-emerald-700',
    in_use: 'bg-amber-100 text-amber-700',
    pending: 'bg-blue-100 text-blue-700',
  }

  return (
    <div
      onClick={() => navigate(`/apply/${spot.id}`)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">
              {spot.building} {spot.spotNumber}
            </h3>
            <p className="text-xs text-slate-400">{spot.ownerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[spot.status]}`}>
            {SPOT_STATUS_LABELS[spot.status]}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-lg">
          <Car className="w-3 h-3" />
          {VEHICLE_SIZE_LABELS[spot.vehicleSize]}
        </span>
        {spot.isWallAdjacent && (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
            靠墙位
          </span>
        )}
      </div>

      <div className="flex items-start gap-1.5 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2">{formatDaySlots(spot.availableSlots)}</span>
      </div>
    </div>
  )
}
