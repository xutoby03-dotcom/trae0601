import type { CarpoolStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/types'

interface StatusBadgeProps {
  status: CarpoolStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${STATUS_COLORS[status]} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}
