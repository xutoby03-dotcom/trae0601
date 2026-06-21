import { Flame } from 'lucide-react';
import '../styles/components.css';

export interface HeatBadgeProps {
  count: number;
  showIcon?: boolean;
  className?: string;
}

export function HeatBadge({ count, showIcon = true, className = '' }: HeatBadgeProps) {
  const displayCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);

  return (
    <span className={`heat-badge ${className}`}>
      {showIcon && <Flame size={13} strokeWidth={2.5} fill="currentColor" />}
      {displayCount}
    </span>
  );
}
