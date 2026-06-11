import type { AppointmentStatus, EventStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus | EventStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<AppointmentStatus | EventStatus, { label: string; className: string }> = {
  'booked': { label: '已预约', className: 'bg-info-100 text-info-600' },
  'checked-in': { label: '已签到', className: 'bg-success-100 text-success-600' },
  'serving': { label: '服务中', className: 'bg-primary-100 text-primary-600' },
  'completed': { label: '已完成', className: 'bg-success-100 text-success-700' },
  'no-show': { label: '爽约', className: 'bg-danger-100 text-danger-600' },
  'waitlist': { label: '候补', className: 'bg-warning-100 text-warning-600' },
  'upcoming': { label: '即将开始', className: 'bg-info-100 text-info-600' },
  'ongoing': { label: '进行中', className: 'bg-primary-100 text-primary-600' },
  'cancelled': { label: '已取消', className: 'bg-warm-200 text-warm-600' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-warm-100 text-warm-600' };
  
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
