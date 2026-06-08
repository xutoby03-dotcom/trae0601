import { useWalkStore } from '@/store/useWalkStore'
import { Clock, Footprints, Wallet, AlertTriangle } from 'lucide-react'

function formatMinutes(m: number): string {
  if (m < 60) return `${m}分钟`
  const h = Math.floor(m / 60)
  const min = m % 60
  return min > 0 ? `${h}小时${min}分` : `${h}小时`
}

export default function RouteStats() {
  const routePlaces = useWalkStore((s) => s.routePlaces)
  const getStats = useWalkStore((s) => s.getStats)

  const stats = getStats()
  const hasWarnings = stats.warnings.length > 0

  if (routePlaces.length === 0) return null

  return (
    <div className="px-4 py-3 border-t border-gray-100">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-orange-50 rounded-xl px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[#F97316] mb-0.5">
            <Clock size={12} />
            <span className="text-[10px] font-medium">总时长</span>
          </div>
          <div className="text-sm font-bold text-[#3D2C2E]">{formatMinutes(stats.totalMinutes)}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
            <Footprints size={12} />
            <span className="text-[10px] font-medium">总距离</span>
          </div>
          <div className="text-sm font-bold text-[#3D2C2E]">{stats.totalDistance.toFixed(1)}km</div>
        </div>
        <div className="bg-amber-50 rounded-xl px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
            <Wallet size={12} />
            <span className="text-[10px] font-medium">总花费</span>
          </div>
          <div className="text-sm font-bold text-[#3D2C2E]">¥{stats.totalBudget}</div>
        </div>
      </div>

      {hasWarnings && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5 text-red-500 mb-1">
            <AlertTriangle size={12} />
            <span className="text-xs font-bold">闭店预警</span>
          </div>
          {stats.warnings.map((w, i) => (
            <div key={i} className="text-xs text-red-400 ml-5 leading-relaxed">
              • {w}
            </div>
          ))}
        </div>
      )}

      {!hasWarnings && routePlaces.length > 0 && (
        <div className="flex items-center gap-1.5 justify-center text-emerald-500 text-xs">
          <span>✅</span>
          <span>路线时间合理，不会撞上闭店时间</span>
        </div>
      )}
    </div>
  )
}
