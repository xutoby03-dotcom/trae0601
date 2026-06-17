import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import type { TaskStatus, ItemStatus } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus | ItemStatus;
  type?: 'task' | 'item';
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  pending: {
    label: '待确认',
    icon: Clock,
    className: 'bg-champagne-gold/10 text-champagne-gold',
  },
  confirmed: {
    label: '已确认',
    icon: CheckCircle,
    className: 'bg-forest/10 text-forest',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle,
    className: 'bg-sage/10 text-sage',
  },
  late: {
    label: '已迟到',
    icon: AlertCircle,
    className: 'bg-wine/10 text-wine animate-pulse-slow',
  },
  idle: {
    label: '待交接',
    icon: Clock,
    className: 'bg-gray-100 text-gray-600',
  },
  intransit: {
    label: '交接中',
    icon: AlertCircle,
    className: 'bg-champagne-gold/10 text-champagne-gold',
  },
  handedover: {
    label: '已交接',
    icon: CheckCircle,
    className: 'bg-forest/10 text-forest',
  },
};

export default function StatusBadge({ status, type = 'task', size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.className} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}
