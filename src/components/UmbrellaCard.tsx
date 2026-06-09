import { useNavigate } from 'react-router-dom'
import { MapPin, Shield, Droplets, ArrowRight, Wrench, Eye } from 'lucide-react'
import type { Umbrella } from '@/types'
import { STATUS_LABELS, SIZE_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, { border: string; badge: string; badgeText: string }> = {
  available: { border: 'border-emerald-200', badge: 'bg-emerald-100', badgeText: 'text-emerald-700' },
  borrowed: { border: 'border-blue-200', badge: 'bg-blue-100', badgeText: 'text-blue-700' },
  damaged: { border: 'border-orange-200', badge: 'bg-orange-100', badgeText: 'text-orange-700' },
  lost: { border: 'border-red-200', badge: 'bg-red-100', badgeText: 'text-red-700' },
}

interface Props {
  umbrella: Umbrella
  isRainy?: boolean
  onRepair?: (id: string) => void
}

export default function UmbrellaCard({ umbrella, isRainy, onRepair }: Props) {
  const navigate = useNavigate()
  const styles = STATUS_STYLES[umbrella.status]

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5',
        styles.border
      )}
    >
      <div className="flex">
        <div
          className="w-2 self-stretch flex-shrink-0"
          style={{ backgroundColor: umbrella.color }}
        />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 font-display">{umbrella.code}</h3>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', styles.badge, styles.badgeText)}>
                {STATUS_LABELS[umbrella.status]}
              </span>
              {isRainy && umbrella.status === 'available' && (
                <Droplets className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
              )}
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/60"
              style={{ backgroundColor: umbrella.color + '20' }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: umbrella.color }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <span className="font-medium text-slate-700">{SIZE_LABELS[umbrella.size]}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {umbrella.location}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {umbrella.deposit > 0 ? `押金¥${umbrella.deposit}` : '免押金'}
            </span>
            <span className="text-slate-400">
              贡献者: {umbrella.contributorName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {umbrella.status === 'available' && (
              <button
                onClick={() => navigate(`/borrow/${umbrella.id}`)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold hover:bg-[#2D5F8B] transition-all duration-200 shadow-md shadow-blue-900/20"
              >
                借用
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {umbrella.status === 'borrowed' && (
              <button
                onClick={() => navigate(`/return/${umbrella.id}`)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
              >
                归还
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {umbrella.status === 'damaged' && onRepair && (
              <button
                onClick={() => onRepair(umbrella.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all duration-200"
              >
                <Wrench className="w-3.5 h-3.5" />
                修好了
              </button>
            )}
            {umbrella.status === 'lost' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-sm">
                <Eye className="w-3.5 h-3.5" />
                待找回
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
