import type { BatchStatus } from '../types';
import { getStatusInfo } from '../utils/statusUtils';

interface StatusBadgeProps {
  status: BatchStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const info = getStatusInfo(status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
      style={{
        backgroundColor: info.bgColor,
        color: info.textColor,
        border: `1px solid ${info.borderColor}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: info.color }}
      />
      {info.label}
    </span>
  );
}
