import { cn } from '@/lib/utils';
import type { VisitStatus } from '@/types';

interface StatusBadgeProps {
  status: VisitStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  upcoming: {
    label: '待就诊',
    className: 'bg-amber-100 text-amber-700',
  },
  confirmed: {
    label: '已确认',
    className: 'bg-secondary-100 text-secondary-700',
  },
  completed: {
    label: '已完成',
    className: 'bg-green-100 text-green-700',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-600',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        config.className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'upcoming' && 'bg-amber-500 animate-pulse',
        status === 'confirmed' && 'bg-secondary-500',
        status === 'completed' && 'bg-green-500',
        status === 'cancelled' && 'bg-gray-400'
      )} />
      {config.label}
    </span>
  );
}
