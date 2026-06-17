import { StarterStatus, AnomalyType } from '@/types';
import { getStatusLabel, getStatusColor, getAnomalyLabel, getAnomalyColor } from '@/utils/format';
import { Lock, Snowflake, CheckCircle, Archive, AlertTriangle, AlertOctagon, X } from 'lucide-react';

interface StatusBadgeProps {
  status: StarterStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const icons = {
    [StarterStatus.HEALTHY]: CheckCircle,
    [StarterStatus.LOCKED]: Lock,
    [StarterStatus.COLD]: Snowflake,
    [StarterStatus.ARCHIVED]: Archive,
  };

  const Icon = icons[status];

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  );
}

interface AnomalyBadgeProps {
  type: AnomalyType;
  size?: 'sm' | 'md';
}

export function AnomalyBadge({ type, size = 'md' }: AnomalyBadgeProps) {
  const color = getAnomalyColor(type);
  const label = getAnomalyLabel(type);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const icons = {
    [AnomalyType.COLLAPSE]: AlertTriangle,
    [AnomalyType.ODOR]: AlertOctagon,
    [AnomalyType.MOLD]: X,
  };

  const Icon = icons[type];

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  );
}
