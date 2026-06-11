import { WaterStatus } from '@/types';
import { getStatusLabel, getStatusColor, getStatusBgColor } from '@/utils/waterCalculator';

interface StatusBadgeProps {
  status: WaterStatus;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function StatusBadge({ status, size = 'md', animate = false }: StatusBadgeProps) {
  const label = getStatusLabel(status);
  const textColor = getStatusColor(status);
  const bgColor = getStatusBgColor(status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium
        ${bgColor} ${textColor}
        ${sizeClasses[size]}
        ${animate ? 'animate-breathe' : ''}
      `}
    >
      {label}
    </span>
  );
}
