import { cn } from '@/lib/utils';
import type { BookingStatus, RepairStatus } from '@/types';

type Status = BookingStatus | RepairStatus;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  Status,
  { bg: string; text: string; label: string }
> = {
  pending_approval: {
    bg: 'bg-state-warning',
    text: 'text-white',
    label: '待审批',
  },
  approved: {
    bg: 'bg-state-info',
    text: 'text-white',
    label: '已确认',
  },
  rejected: {
    bg: 'bg-state-danger',
    text: 'text-white',
    label: '已拒绝',
  },
  waiting_checkin: {
    bg: 'bg-state-info-light',
    text: 'text-white',
    label: '待签到',
  },
  checked_in: {
    bg: 'bg-state-success',
    text: 'text-white',
    label: '使用中',
  },
  completed: {
    bg: 'bg-state-success/50',
    text: 'text-white',
    label: '已完成',
  },
  no_show: {
    bg: 'bg-state-danger',
    text: 'text-white',
    label: '爽约',
  },
  cancelled: {
    bg: 'bg-text-muted',
    text: 'text-white',
    label: '已取消',
  },
  waitlisted: {
    bg: 'bg-state-warning/60',
    text: 'text-white',
    label: '候补中',
  },
  pending: {
    bg: 'bg-state-warning',
    text: 'text-white',
    label: '待处理',
  },
  processing: {
    bg: 'bg-state-info',
    text: 'text-white',
    label: '维修中',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.bg,
        config.text,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
}
