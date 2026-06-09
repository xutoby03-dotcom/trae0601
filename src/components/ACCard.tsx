import { useNavigate } from 'react-router-dom'
import { Wind, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type AirConditioner, getDaysSince, getACStatus, FILTER_TYPE_LABELS } from '@/store/useStore'

const STATUS_COLORS: Record<string, string> = {
  overdue: 'border-l-[#F43F5E] bg-rose-50',
  'due-soon': 'border-l-[#0EA5E9] bg-sky-50',
  clean: 'border-l-[#34D399] bg-emerald-50',
}

const STATUS_DOT: Record<string, string> = {
  overdue: 'bg-[#F43F5E]',
  'due-soon': 'bg-[#0EA5E9]',
  clean: 'bg-[#34D399]',
}

const STATUS_DAYS_TEXT: Record<string, string> = {
  overdue: 'text-[#F43F5E]',
  'due-soon': 'text-[#0EA5E9]',
  clean: 'text-[#34D399]',
}

interface ACCardProps {
  ac: AirConditioner
}

export default function ACCard({ ac }: ACCardProps) {
  const navigate = useNavigate()
  const status = getACStatus(ac)
  const days = getDaysSince(ac.lastCleanDate)

  return (
    <div
      onClick={() => navigate(`/ac/${ac.id}`)}
      className={cn(
        'cursor-pointer rounded-xl border-l-4 p-4 transition-all hover:shadow-md active:scale-[0.98]',
        STATUS_COLORS[status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[status])} />
          <span className="text-lg font-semibold text-gray-800">{ac.room}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {ac.highAltitudeWork && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          <Wind className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">{ac.brand}</span>
        <span className={cn('text-sm font-bold', STATUS_DAYS_TEXT[status])}>
          {days}天
        </span>
      </div>

      <div className="mt-2">
        <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-500 shadow-sm">
          {FILTER_TYPE_LABELS[ac.filterType]}
        </span>
      </div>
    </div>
  )
}
