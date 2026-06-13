import type { CouponStatus } from '@/types';
import { getStatusText, getStatusColorClass } from '@/utils';

interface StatusTagProps {
  status: CouponStatus;
  size?: 'sm' | 'md';
}

export default function StatusTag({ status, size = 'md' }: StatusTagProps) {
  const colorClass = getStatusColorClass(status);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span className={`status-tag ${colorClass} ${sizeClass}`}>
      {getStatusText(status)}
    </span>
  );
}
