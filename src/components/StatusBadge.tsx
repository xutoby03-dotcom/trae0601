import type { GameStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
import { Check, AlertTriangle, ArrowRightLeft } from 'lucide-react'

const iconMap: Record<GameStatus, React.ReactNode> = {
  complete: <Check className="w-3 h-3" />,
  missing: <AlertTriangle className="w-3 h-3" />,
  lent: <ArrowRightLeft className="w-3 h-3" />,
}

interface StatusBadgeProps {
  status: GameStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      {iconMap[status]}
      {STATUS_LABELS[status]}
    </span>
  )
}
