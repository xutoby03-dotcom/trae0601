import { BatchStatus } from '@/types';

interface StatusBadgeProps {
  status: BatchStatus;
}

const statusConfig: Record<BatchStatus, { label: string; className: string }> = {
  brewing: {
    label: '浸泡中',
    className: 'bg-matcha-100 text-matcha-700 border-matcha-200',
  },
  ready: {
    label: '待过滤',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  overdue: {
    label: '已超时',
    className: 'bg-coral-100 text-coral-700 border-coral-200',
  },
  filtered: {
    label: '在售中',
    className: 'bg-forest-100 text-forest-700 border-forest-200',
  },
  off_shelf: {
    label: '已下架',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {status === 'overdue' && (
        <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mr-1.5 animate-pulse" />
      )}
      {status === 'ready' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
