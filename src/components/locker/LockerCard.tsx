import { Snowflake, Edit2, Trash2, Package, Clock } from 'lucide-react'
import type { Locker, Package as PackageType } from '@/types'
import { SIZE_LABEL, SIZE_BADGE_COLOR } from '@/utils/constants'
import { formatDuration } from '@/utils/helpers'

interface LockerCardProps {
  locker: Locker
  currentPackage?: PackageType
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  selectable?: boolean
  selected?: boolean
}

export default function LockerCard({ locker, currentPackage, onClick, onEdit, onDelete, selectable, selected }: LockerCardProps) {
  const statusConfig = {
    empty: {
      bg: 'bg-white hover:bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      dot: 'bg-emerald-500',
      statusLabel: '空闲',
      statusClass: 'text-emerald-600 bg-emerald-100',
    },
    occupied: {
      bg: 'bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-400',
      dot: 'bg-blue-500',
      statusLabel: '占用',
      statusClass: 'text-blue-600 bg-blue-100',
    },
    urgent: {
      bg: 'bg-gradient-to-br from-warning-50 to-orange-50 hover:from-warning-100 hover:to-orange-100 border-warning-400',
      dot: 'bg-warning-500 animate-pulse-slow',
      statusLabel: '催取',
      statusClass: 'text-warning-600 bg-warning-100 animate-pulse-slow',
    },
  }[locker.status]

  const isClickable = selectable ? locker.status === 'empty' : !!onClick

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`relative rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        selected
          ? 'ring-4 ring-primary-400 border-primary-500 bg-primary-50'
          : statusConfig.bg
      } ${
        isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : ''
      } ${locker.isRefrigerated ? 'ring-1 ring-blue-400/30' : ''}`}
    >
      {locker.isRefrigerated && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
            <Snowflake size={14} className="text-white" />
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              <h4 className="font-serif font-bold text-xl text-slate-800">{locker.code}</h4>
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${SIZE_BADGE_COLOR[locker.size]}`}>
              {SIZE_LABEL[locker.size]}
            </span>
          </div>
          {!selectable && (onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit() }}
                  className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-primary-600 hover:shadow-sm transition-all"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-red-500 hover:shadow-sm transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {locker.photo ? (
          <div className="w-full h-20 rounded-lg bg-slate-100 mb-3 overflow-hidden">
            <img src={locker.photo} alt={locker.code} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-20 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 mb-3 flex items-center justify-center">
            <Package size={28} className="text-slate-300" />
          </div>
        )}

        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1 line-clamp-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          {locker.location}
        </p>

        {currentPackage ? (
          <div className={`rounded-lg p-2.5 ${
            locker.status === 'urgent' ? 'bg-warning-100/80' : 'bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-slate-700">{currentPackage.recipientName}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConfig.statusClass}`}>
                {statusConfig.statusLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>****{currentPackage.phoneLastFour}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatDuration(currentPackage.inTime)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{currentPackage.expressCompany}</p>
          </div>
        ) : (
          <div className={`rounded-lg p-2.5 text-center ${
            selectable && selected ? 'bg-primary-100' : 'bg-emerald-50'
          }`}>
            <span className={`text-xs font-medium ${
              selectable && selected ? 'text-primary-700' : 'text-emerald-600'
            }`}>
              {selectable ? (selected ? '✓ 已选择此柜格' : '点击选择此柜格') : '可使用'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
