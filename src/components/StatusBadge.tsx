import { COAT_STATUS_LABELS, LENDING_STATUS_LABELS, BATCH_STATUS_LABELS } from '../types';
import type { CoatStatus, LendingStatus, BatchStatus } from '../types';
import { cn } from '../lib/utils';

const coatStatusColors: Record<CoatStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_use: 'bg-blue-100 text-blue-700 border-blue-200',
  pending_cleaning: 'bg-amber-100 text-amber-700 border-amber-200',
  cleaning: 'bg-purple-100 text-purple-700 border-purple-200',
  repairing: 'bg-orange-100 text-orange-700 border-orange-200',
  scrapped: 'bg-gray-100 text-gray-700 border-gray-200',
};

const lendingStatusColors: Record<LendingStatus, string> = {
  active: 'bg-blue-100 text-blue-700 border-blue-200',
  returned: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
};

const batchStatusColors: Record<BatchStatus, string> = {
  cleaning: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

interface StatusBadgeProps {
  type: 'coat' | 'lending' | 'batch';
  status: CoatStatus | LendingStatus | BatchStatus;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  let label = '';
  let colors = '';

  if (type === 'coat') {
    label = COAT_STATUS_LABELS[status as CoatStatus];
    colors = coatStatusColors[status as CoatStatus];
  } else if (type === 'lending') {
    label = LENDING_STATUS_LABELS[status as LendingStatus];
    colors = lendingStatusColors[status as LendingStatus];
  } else if (type === 'batch') {
    label = BATCH_STATUS_LABELS[status as BatchStatus];
    colors = batchStatusColors[status as BatchStatus];
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors,
        className
      )}
    >
      {label}
    </span>
  );
}
