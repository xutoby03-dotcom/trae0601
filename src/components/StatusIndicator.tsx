import type { StatusLevel, MoldStatus } from '../types';
import { getStatusLabel, getMoldLabel } from '../utils/riskCalculator';

interface StatusIndicatorProps {
  type: 'suction' | 'corner' | 'mold';
  status: StatusLevel | MoldStatus;
  showLabel?: boolean;
}

const getColorClass = (status: string): string => {
  if (status === 'good' || status === 'none') return 'text-emerald-500';
  if (status === 'normal' || status === 'mild') return 'text-amber-500';
  return 'text-red-500';
};

const getBgClass = (status: string): string => {
  if (status === 'good' || status === 'none') return 'bg-emerald-100';
  if (status === 'normal' || status === 'mild') return 'bg-amber-100';
  return 'bg-red-100';
};

const getIcon = (type: string, status: string): string => {
  if (type === 'suction') return '🧲';
  if (type === 'corner') return '📐';
  if (status === 'none') return '🍃';
  if (status === 'mild') return '🍄';
  return '🦠';
};

export const StatusIndicator = ({ type, status, showLabel = true }: StatusIndicatorProps) => {
  const colorClass = getColorClass(status);
  const bgClass = getBgClass(status);
  const icon = getIcon(type, status);
  const label = type === 'mold' ? getMoldLabel(status as MoldStatus) : getStatusLabel(status as StatusLevel);

  return (
    <div className="flex items-center gap-2">
      <span className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center text-lg`}>
        {icon}
      </span>
      {showLabel && (
        <span className={`text-sm font-medium ${colorClass}`}>
          {label}
        </span>
      )}
    </div>
  );
};
