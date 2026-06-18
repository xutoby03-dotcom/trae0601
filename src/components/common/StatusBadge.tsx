import type { TableStatus, BookingStatus, DamageStatus } from '../../types';

interface TableStatusBadgeProps {
  status: TableStatus;
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const config: Record<TableStatus, { label: string; className: string }> = {
    available: { label: '空闲', className: 'badge-available' },
    'in-use': { label: '使用中', className: 'badge-in-use' },
    maintenance: { label: '维护中', className: 'badge-maintenance' },
    disabled: { label: '已停用', className: 'bg-gray-100 text-gray-500 badge' },
  };

  const { label, className } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
}

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config: Record<BookingStatus, { label: string; className: string }> = {
    pending: { label: '待签到', className: 'badge-pending' },
    'checked-in': { label: '进行中', className: 'badge-in-use' },
    completed: { label: '已完成', className: 'badge-completed' },
    cancelled: { label: '已取消', className: 'bg-gray-100 text-gray-500 badge' },
    'no-show': { label: '爽约', className: 'badge-no-show' },
  };

  const { label, className } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
}

interface DamageStatusBadgeProps {
  status: DamageStatus;
}

export function DamageStatusBadge({ status }: DamageStatusBadgeProps) {
  const config: Record<DamageStatus, { label: string; className: string }> = {
    pending: { label: '待处理', className: 'badge-maintenance' },
    resolved: { label: '已修复', className: 'badge-available' },
  };

  const { label, className } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
}
