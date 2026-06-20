import { sealStatusLabels, sealStatusColors } from '@/types';
import type { Bag } from '@/types';

interface StatusBadgeProps {
  status: Bag['sealStatus'];
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${sealStatusColors[status]}`}>
      <span className={`w-2 h-2 rounded-full ${
        status === 'unsealed' ? 'bg-gray-400' :
        status === 'sealed' ? 'bg-yellow-400' :
        status === 'confirmed' ? 'bg-green-400' :
        'bg-red-400'
      } ${status === 'unsealed' ? 'animate-pulse-dot' : ''}`} />
      {sealStatusLabels[status]}
    </span>
  );
}
