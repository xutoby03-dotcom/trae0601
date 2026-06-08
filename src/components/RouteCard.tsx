import type { FrequentRoute } from '@/types'
import { useNavigate } from 'react-router-dom'
import { Repeat, ArrowRight, ChevronRight } from 'lucide-react'

interface RouteCardProps {
  route: FrequentRoute
  onRepublish: (departure: string, destination: string) => void
}

export default function RouteCard({ route, onRepublish }: RouteCardProps) {
  return (
    <div className="flex-shrink-0 w-56 bg-white rounded-2xl border border-orange-100 p-4 hover:shadow-md hover:border-orange-200 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Repeat className="w-4 h-4 text-orange-500" />
        </div>
        <span className="text-xs text-slate-400 font-medium">常用路线</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-slate-700 truncate">{route.departure}</span>
        <ArrowRight className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-700 truncate">{route.destination}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">已拼{route.count}次</span>
        <button
          onClick={() => onRepublish(route.departure, route.destination)}
          className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-0.5 group-hover:gap-1.5 transition-all"
        >
          一键再发
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
