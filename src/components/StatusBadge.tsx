import { DEVICE_STATUS_MAP } from '@/utils/helpers'
import type { DeviceStatus } from '@/types'

interface StatusBadgeProps {
  status: DeviceStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const info = DEVICE_STATUS_MAP[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.bg} ${info.color}`}>
      {info.label}
    </span>
  )
}
