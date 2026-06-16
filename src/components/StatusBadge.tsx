import { AlertCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { ExceptionStatus } from '@/types';

const statusConfig: Record<ExceptionStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: {
    label: '待处理',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: Clock,
  },
  processing: {
    label: '处理中',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: AlertCircle,
  },
  escalated: {
    label: '已升级',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: AlertTriangle,
  },
  resolved: {
    label: '已解决',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: CheckCircle,
  },
};

interface StatusBadgeProps {
  status: ExceptionStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const pulseClass = status === 'escalated' ? 'animate-pulse' : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.color} font-medium ${sizeClass} ${pulseClass}`}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      {config.label}
    </span>
  );
}
