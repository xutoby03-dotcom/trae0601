import { cn } from '@/utils/helpers';
import { getIssueLabel, getIssueColor } from '@/utils/helpers';
import type { IssueType, TableStatus } from '@/types';

interface StatusBadgeProps {
  type: 'status' | 'issue';
  value: TableStatus | IssueType;
  pulse?: boolean;
}

const statusStyles: Record<TableStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  borrowed: 'bg-blue-100 text-blue-700 border-blue-200',
  maintenance: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusLabels: Record<TableStatus, string> = {
  available: '可借用',
  borrowed: '已借出',
  maintenance: '维修中',
};

export default function StatusBadge({ type, value, pulse = false }: StatusBadgeProps) {
  const isIssue = type === 'issue';
  const styles = isIssue ? getIssueColor(value as IssueType) : statusStyles[value as TableStatus];
  const label = isIssue ? getIssueLabel(value as IssueType) : statusLabels[value as TableStatus];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        styles,
        pulse && 'animate-pulse'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isIssue && value === 'overdue' && 'bg-red-500',
          isIssue && value === 'missing_parts' && 'bg-amber-500',
          isIssue && value === 'desktop_damaged' && 'bg-orange-500',
          !isIssue && value === 'available' && 'bg-emerald-500',
          !isIssue && value === 'borrowed' && 'bg-blue-500',
          !isIssue && value === 'maintenance' && 'bg-gray-500'
        )}
      />
      {label}
    </span>
  );
}
