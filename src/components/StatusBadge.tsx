import type { GearStatus } from '../types';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: GearStatus;
}

const statusConfig: Record<GearStatus, { label: string; className: string }> = {
  in_cabinet: { label: '在柜', className: 'bg-green-100 text-green-800' },
  lent: { label: '借出中', className: 'bg-purple-100 text-purple-800' },
  drying: { label: '待晾干', className: 'bg-orange-100 text-orange-800' },
  damaged: { label: '已破损', className: 'bg-red-100 text-red-800' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
