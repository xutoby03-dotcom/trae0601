import { MapPin, Monitor } from 'lucide-react';
import '../styles/components.css';

export type SourceType = 'onsite' | 'online';

export interface SourceBadgeProps {
  source: SourceType;
  showIcon?: boolean;
  className?: string;
}

const labelMap: Record<SourceType, string> = {
  onsite: '现场',
  online: '线上',
};

const iconMap: Record<SourceType, React.ReactNode> = {
  onsite: <MapPin size={12} strokeWidth={2.5} />,
  online: <Monitor size={12} strokeWidth={2.5} />,
};

export function SourceBadge({ source, showIcon = true, className = '' }: SourceBadgeProps) {
  return (
    <span className={`source-badge source-badge-${source} ${className}`}>
      {showIcon && iconMap[source]}
      {labelMap[source]}
    </span>
  );
}
