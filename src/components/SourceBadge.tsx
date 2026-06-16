import { Phone, Users, Wifi, Home, Circle } from 'lucide-react';
import { CheckInSource } from '@/types';
import { sourceConfig } from '@/utils/source';

const iconMap: Record<string, React.ElementType> = {
  Phone,
  Users,
  Wifi,
  Home,
  Circle,
};

interface SourceBadgeProps {
  source: CheckInSource;
  size?: 'sm' | 'md';
}

export default function SourceBadge({ source, size = 'md' }: SourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = iconMap[config.icon] || Circle;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.color} font-medium ${sizeClass} transition-all hover:scale-105`}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      {config.label}
    </span>
  );
}
