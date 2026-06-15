import { TICKET_STATUS_MAP, PRIORITY_MAP } from '@/types'

interface StatusBadgeProps {
  type: 'status' | 'priority'
  value: string
}

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  const config = type === 'status' ? TICKET_STATUS_MAP[value] : PRIORITY_MAP[value]

  if (!config) return null

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  )
}
