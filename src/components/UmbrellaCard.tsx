import { useNavigate } from 'react-router-dom'
import { MapPin, Shield, Droplets, ArrowRight, Wrench, Eye, Clock, Camera } from 'lucide-react'
import type { Umbrella, BorrowRecord } from '@/types'
import { STATUS_LABELS, SIZE_LABELS, DAMAGE_TYPE_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/helpers'

const STATUS_STYLES: Record<string, { border: string; badge: string; badgeText: string }> = {
  available: { border: 'border-emerald-200', badge: 'bg-emerald-100', badgeText: 'text-emerald-700' },
  borrowed: { border: 'border-blue-200', badge: 'bg-blue-100', badgeText: 'text-blue-700' },
  damaged: { border: 'border-orange-200', badge: 'bg-orange-100', badgeText: 'text-orange-700' },
  lost: { border: 'border-red-200', badge: 'bg-red-100', badgeText: 'text-red-700' },
}

interface Props {
  umbrella: Umbrella
  latestRecord?: BorrowRecord
  isRainy?: boolean
  onRepair?: (id: string) => void
}

export default function UmbrellaCard({ umbrella, latestRecord, isRainy, onRepair }: Props) {
  const navigate = useNavigate()
  const styles = STATUS_STYLES[umbrella.status]
  const showRecord = (umbrella.status === 'damaged' || umbrella.status === 'lost') && latestRecord

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

          {showRecord && latestRecord && (
            <div
              onClick={() => navigate(`/umbrella/${umbrella.id}`)}
              className="mb-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                {latestRecord.returnPhotoUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200/60">
                    <img src={latestRecord.returnPhotoUrl} alt="归还照片" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      归还至 {latestRecord.returnLocation}
                    </span>
                    {latestRecord.actualReturnTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(latestRecord.actualReturnTime)}
                      </span>
                    )}
                  </div>
                  {latestRecord.damageTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {latestRecord.damageTypes.map((dt) => (
                        <span
                          key={dt}
                          className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium"
                        >
                          {DAMAGE_TYPE_LABELS[dt]}
                        </span>
                      ))}
                    </div>
                  )}
                  {latestRecord.conditionOnReturn === 'lost' && (
                    <p className="text-[11px] text-red-500 mt-1">借用者报告丢失</p>
                  )}
                </div>
                {!latestRecord.returnPhotoUrl && (
                  <Camera className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                )}
              </div>
            </div>
          )}

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
            {showRecord && (
              <button
                onClick={() => navigate(`/umbrella/${umbrella.id}`)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
              >
                详情
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
