import { getStatusBgColor } from '@/utils/seatStatus';
import type { SeatStatus, HandleResult } from '@/types';
import { HANDLE_RESULT_LABELS } from '@/types';

interface SeatStatusBadgeProps {
  status: SeatStatus;
  count?: number;
}

export function SeatStatusBadge({ status, count }: SeatStatusBadgeProps) {
  const labels: Record<SeatStatus, string> = {
    quiet: '安静',
    warning: '有反馈',
    serious: '需关注',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(status)}`}>
      {labels[status]}
      {count !== undefined && count > 0 && ` (${count})`}
    </span>
  );
}

interface HandleStatusBadgeProps {
  status: HandleResult;
}

export function HandleStatusBadge({ status }: HandleStatusBadgeProps) {
  const colors: Record<HandleResult, string> = {
    pending: 'bg-amber-100 text-amber-800',
    reminded: 'bg-blue-100 text-blue-800',
    moved: 'bg-purple-100 text-purple-800',
    cleared: 'bg-green-100 text-green-800',
    false_alarm: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {HANDLE_RESULT_LABELS[status]}
    </span>
  );
}
