import { bagStatusMap, borrowStatusMap, insulationStatusMap, platformMap } from '@/utils/helpers';
import type { BagStatus, BorrowStatus, InsulationStatus, Platform } from '@/types';

interface StatusTagProps {
  type: 'bag' | 'borrow' | 'insulation' | 'platform';
  status: string;
  size?: 'sm' | 'md';
}

export function StatusTag({ type, status, size = 'md' }: StatusTagProps) {
  let config: { label: string; color: string } | undefined;
  
  switch (type) {
    case 'bag':
      config = bagStatusMap[status as BagStatus];
      break;
    case 'borrow':
      config = borrowStatusMap[status as BorrowStatus];
      break;
    case 'insulation':
      config = insulationStatusMap[status as InsulationStatus];
      break;
    case 'platform':
      config = platformMap[status as Platform];
      break;
  }
  
  if (!config) return null;
  
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.color}`}>
      {config.label}
    </span>
  );
}
