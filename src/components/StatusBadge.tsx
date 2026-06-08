import type { ToolStatus } from '@/types'
import { STATUS_LABELS } from '@/types'

const statusStyles: Record<ToolStatus, string> = {
  available: 'bg-grass-100 text-grass-700 border-grass-200',
  borrowed: 'bg-amber-100 text-amber-700 border-amber-200',
  maintenance: 'bg-red-100 text-red-700 border-red-200',
}

const statusDots: Record<ToolStatus, string> = {
  available: 'bg-grass-500',
  borrowed: 'bg-amber-500',
  maintenance: 'bg-red-500',
}

interface StatusBadgeProps {
  status: ToolStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${statusStyles[status]} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}
