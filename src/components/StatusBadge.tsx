import type { CylinderStatus, AbnormalType } from '@/types';

interface StatusBadgeProps {
  status: CylinderStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  normal: { label: '正常', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  low: { label: '低压', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  expired: { label: '已过期', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  abnormal: { label: '异常', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} ${config.text} ${sizeClass} font-medium`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status === 'low' ? 'animate-pulse' : ''}`}></span>
      {config.label}
    </span>
  );
}

interface AbnormalTypeBadgeProps {
  type: AbnormalType;
}

const abnormalTypeConfig: Record<AbnormalType, { label: string; className: string }> = {
  empty_return: { label: '空瓶归还', className: 'bg-slate-100 text-slate-700' },
  exchange: { label: '换瓶', className: 'bg-blue-100 text-blue-700' },
  leak: { label: '漏气', className: 'bg-red-100 text-red-700' },
  valve: { label: '阀门异常', className: 'bg-orange-100 text-orange-700' },
};

export function AbnormalTypeBadge({ type }: AbnormalTypeBadgeProps) {
  const config = abnormalTypeConfig[type];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
