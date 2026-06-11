import { SEAT_STATUS_LABELS, SEAT_STATUS_COLORS } from '../types';
import type { SeatStatus } from '../types';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: SeatStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, showLabel = true, size = 'md' }: StatusBadgeProps) {
  const colors = SEAT_STATUS_COLORS[status];
  const label = SEAT_STATUS_LABELS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      <span className={cn('rounded-full', colors.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {showLabel && label}
    </span>
  );
}
