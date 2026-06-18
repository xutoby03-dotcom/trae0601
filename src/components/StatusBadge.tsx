import { BorrowStatusLabels, ExceptionStatusLabels, MoldStatusLabels } from '../../shared/types.js';
import type { BorrowStatus, ExceptionStatus, MoldStatus } from '../../shared/types.js';

interface StatusBadgeProps {
  status: BorrowStatus | ExceptionStatus | MoldStatus;
  type?: 'borrow' | 'exception' | 'mold';
}

const statusColors: Record<string, string> = {
  available: 'bg-matcha-100 text-matcha-700 border-matcha-300',
  borrowed: 'bg-blue-100 text-blue-700 border-blue-300',
  maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  damaged: 'bg-tomato-100 text-tomato-700 border-tomato-300',
  lost: 'bg-gray-100 text-gray-700 border-gray-300',
  returned: 'bg-matcha-100 text-matcha-700 border-matcha-300',
  overdue: 'bg-tomato-100 text-tomato-700 border-tomato-300',
  exception: 'bg-orange-100 text-orange-700 border-orange-300',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  processing: 'bg-blue-100 text-blue-700 border-blue-300',
  resolved: 'bg-matcha-100 text-matcha-700 border-matcha-300',
};

export function StatusBadge({ status, type = 'mold' }: StatusBadgeProps) {
  let label = '';
  if (type === 'borrow') {
    label = BorrowStatusLabels[status as BorrowStatus];
  } else if (type === 'exception') {
    label = ExceptionStatusLabels[status as ExceptionStatus];
  } else {
    label = MoldStatusLabels[status as MoldStatus];
  }

  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} transition-all duration-200`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'available' || status === 'returned' || status === 'resolved' ? 'bg-matcha-500' :
        status === 'overdue' || status === 'damaged' ? 'bg-tomato-500 animate-pulse' :
        status === 'pending' || status === 'maintenance' ? 'bg-yellow-500 animate-pulse' :
        'bg-blue-500'
      }`} />
      {label}
    </span>
  );
}
