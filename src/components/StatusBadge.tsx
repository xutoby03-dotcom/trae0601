import { cn } from '@/lib/utils';
import { getStatusLabel, getStatusColor, getChangeTypeLabel, getChangeTypeColor } from '../utils/helpers';

interface StatusBadgeProps {
  status: string;
  type?: 'reservation' | 'change';
  className?: string;
}

export function StatusBadge({ status, type = 'reservation', className }: StatusBadgeProps) {
  const label = type === 'change' ? getChangeTypeLabel(status) : getStatusLabel(status);
  const colorClass = type === 'change' ? getChangeTypeColor(status) : getStatusColor(status);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
