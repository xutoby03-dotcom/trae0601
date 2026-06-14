import { InspectionStatus, NotificationStatus, RiskLevel } from '@/types';
import { INSPECTION_STATUS_LABELS, INSPECTION_STATUS_COLORS, NOTIFICATION_STATUS_LABELS, NOTIFICATION_STATUS_COLORS } from '@/constants';
import { cn } from '@/utils/helpers';

interface StatusBadgeProps {
  type: 'inspection' | 'notification' | 'risk';
  status: InspectionStatus | NotificationStatus | RiskLevel;
  size?: 'sm' | 'md';
}

const riskColors: Record<RiskLevel, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const riskLabels: Record<RiskLevel, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
};

export default function StatusBadge({ type, status, size = 'md' }: StatusBadgeProps) {
  let label = '';
  let colorClass = '';

  if (type === 'inspection') {
    label = INSPECTION_STATUS_LABELS[status as InspectionStatus];
    colorClass = INSPECTION_STATUS_COLORS[status as InspectionStatus];
  } else if (type === 'notification') {
    label = NOTIFICATION_STATUS_LABELS[status as NotificationStatus];
    colorClass = NOTIFICATION_STATUS_COLORS[status as NotificationStatus];
  } else {
    label = riskLabels[status as RiskLevel];
    colorClass = riskColors[status as RiskLevel];
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        colorClass
      )}
    >
      {type === 'risk' && status === 'high' && (
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
}
