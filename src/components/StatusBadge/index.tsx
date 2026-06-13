import { ComplaintStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const statusStyles: Record<ComplaintStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function StatusBadge({ status, size = 'md', pulse = false }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        statusStyles[status],
        sizeClasses,
        pulse && status === 'overdue' && 'animate-pulse border-red-500'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-yellow-400': status === 'pending',
        'bg-blue-400': status === 'processing',
        'bg-emerald-400': status === 'completed',
        'bg-red-400': status === 'overdue',
      })} />
      {STATUS_LABELS[status]}
    </span>
  );
}
