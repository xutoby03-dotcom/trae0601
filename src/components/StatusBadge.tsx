import type { FlavorStatus } from '../types';
import { getFlavorStatusText, getFlavorStatusColor } from '../utils/flavorUtils';

interface StatusBadgeProps {
  status: FlavorStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const text = getFlavorStatusText(status);
  const colorClass = getFlavorStatusColor(status);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass}`}
    >
      {status === 'expired' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
      )}
      {text}
    </span>
  );
}
