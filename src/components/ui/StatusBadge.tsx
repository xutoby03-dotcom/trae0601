import type { VaccineStatus } from '@/types';
import { Clock, CalendarCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: VaccineStatus;
}

const STATUS_CONFIG = {
  pending: {
    label: '待预约',
    className: 'badge-pending',
    Icon: Clock,
  },
  appointed: {
    label: '已预约',
    className: 'badge-appointed',
    Icon: CalendarCheck,
  },
  completed: {
    label: '已完成',
    className: 'badge-completed',
    Icon: CheckCircle2,
  },
  overdue: {
    label: '已逾期',
    className: 'badge-overdue',
    Icon: AlertTriangle,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.Icon;
  return (
    <span className={config.className}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
