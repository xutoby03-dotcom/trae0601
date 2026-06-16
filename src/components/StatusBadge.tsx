import { cn } from '@/lib/utils';
import type { DeviceStatus, BookingStatus, TaskStatus } from '../types';

type Status = DeviceStatus | BookingStatus | TaskStatus;

const statusConfig: Record<Status, { label: string; className: string }> = {
  IDLE: {
    label: '空闲',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  OCCUPIED: {
    label: '占用中',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  CLEANING_PENDING: {
    label: '待清洁',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  PAUSED: {
    label: '暂停使用',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  MAINTENANCE: {
    label: '维修中',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  PENDING: {
    label: '待处理',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  IN_USE: {
    label: '使用中',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: '已完成',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  NO_SHOW: {
    label: '未到场',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  CANCELLED: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  IN_PROGRESS: {
    label: '进行中',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
        config.className,
        className,
      )}
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
