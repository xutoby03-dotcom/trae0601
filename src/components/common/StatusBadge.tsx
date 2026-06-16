import { cn } from '@/lib/utils';
import type { CableStatus, BorrowStatus } from '@/types';
import { CABLE_STATUS_LABELS, BORROW_STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: CableStatus | BorrowStatus;
  type?: 'cable' | 'borrow';
  size?: 'sm' | 'md';
}

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800 border-green-200',
  borrowed: 'bg-blue-100 text-blue-800 border-blue-200',
  maintaining: 'bg-orange-100 text-orange-800 border-orange-200',
  scrapped: 'bg-gray-100 text-gray-600 border-gray-200',
  borrowing: 'bg-blue-100 text-blue-800 border-blue-200',
  returned: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
};

export const StatusBadge = ({ status, type = 'cable', size = 'md' }: StatusBadgeProps) => {
  const label = type === 'cable' 
    ? CABLE_STATUS_LABELS[status as CableStatus] 
    : BORROW_STATUS_LABELS[status as BorrowStatus];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        statusColors[status],
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      {label}
    </span>
  );
};
