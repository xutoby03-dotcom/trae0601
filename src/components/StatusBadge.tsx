import { twMerge } from 'tailwind-merge';

type StatusType = 'normal' | 'warning' | 'danger' | 'pending' | 'processing' | 'closed';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  normal: { label: '正常', className: 'bg-emerald-100 text-emerald-700' },
  warning: { label: '预警', className: 'bg-amber-100 text-amber-700' },
  danger: { label: '异常', className: 'bg-red-100 text-red-700' },
  pending: { label: '待处理', className: 'bg-orange-100 text-orange-700' },
  processing: { label: '处理中', className: 'bg-blue-100 text-blue-700' },
  closed: { label: '已关闭', className: 'bg-gray-100 text-gray-700' }
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
