import { STATUS_LABELS, STATUS_COLORS } from '../../shared/constants';
import type { GuestStatus } from '../../shared/types';

interface StatusBadgeProps {
  status: GuestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`badge ${colorClass}`}>
      {label}
    </span>
  );
}
