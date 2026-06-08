import type { GearStatus } from '@/types'
import { getStatusBgClass, getStatusColor } from '@/utils/statusCalc'
import { STATUS_LABELS } from '@/types'

interface StatusBadgeProps {
  status: GearStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const color = getStatusColor(status)
  const bgClass = getStatusBgClass(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${bgClass} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <span
        className="rounded-full"
        style={{
          width: size === 'sm' ? 6 : 8,
          height: size === 'sm' ? 6 : 8,
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}80`,
        }}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}
