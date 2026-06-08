import type { FrequentRoute } from '@/types'
import { Repeat, ArrowRight, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/utils/cost'

interface RouteCardProps {
  route: FrequentRoute
  onRepublish: (departure: string, destination: string, avgCost: number) => void
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
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-slate-700 truncate">{route.departure}</span>
        <ArrowRight className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-700 truncate">{route.destination}</span>
      </div>
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
        <span>已拼{route.count}次</span>
        <span>·</span>
        <span className="text-orange-600 font-medium">约{formatCurrency(route.avgCost)}</span>
      </div>
      <button
        onClick={() => onRepublish(route.departure, route.destination, route.avgCost)}
        className="w-full py-1.5 rounded-lg bg-orange-50 text-xs font-medium text-orange-600 hover:bg-orange-100 flex items-center justify-center gap-1 group-hover:gap-1.5 transition-all"
      >
        一键再发
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}
