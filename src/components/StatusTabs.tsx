import type { UmbrellaStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<UmbrellaStatus, { color: string; bg: string; dot: string }> = {
  available: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  borrowed: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  damaged: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  lost: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
}

const TAB_ORDER: UmbrellaStatus[] = ['available', 'borrowed', 'damaged', 'lost']

interface Props {
  activeTab: UmbrellaStatus
  onTabChange: (tab: UmbrellaStatus) => void
  counts: Record<UmbrellaStatus, number>
}

export default function StatusTabs({ activeTab, onTabChange, counts }: Props) {
  return (
    <div className="flex gap-1.5 p-1 bg-white/60 backdrop-blur rounded-xl border border-slate-200/60">
      {TAB_ORDER.map((status) => {
        const config = STATUS_CONFIG[status]
        const isActive = activeTab === status
        return (
          <button
            key={status}
            onClick={() => onTabChange(status)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              isActive
                ? `${config.bg} border ${config.color} font-semibold shadow-sm`
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', config.dot, isActive ? 'animate-pulse' : '')} />
            {STATUS_LABELS[status]}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              isActive ? config.color : 'text-slate-400',
              isActive && status === 'available' ? 'bg-emerald-100' : '',
              isActive && status === 'borrowed' ? 'bg-blue-100' : '',
              isActive && status === 'damaged' ? 'bg-orange-100' : '',
              isActive && status === 'lost' ? 'bg-red-100' : '',
              !isActive ? 'bg-slate-100' : ''
            )}>
              {counts[status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
