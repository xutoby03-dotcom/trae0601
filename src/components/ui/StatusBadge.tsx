import { JarStatus, SealRingStatus } from '@/types';
import { getStatusLabel, getSealLabel } from '@/utils/alert';

interface StatusBadgeProps {
  status: JarStatus | SealRingStatus | string;
  type?: 'jar' | 'seal' | 'alert';
}

const jarStatusStyles: Record<JarStatus, string> = {
  sealed: 'bg-teaGreen-50 text-teaGreen-700 border-teaGreen-200',
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  sold: 'bg-gray-100 text-gray-600 border-gray-200',
  damaged: 'bg-red-50 text-red-600 border-red-200',
};

const sealStatusStyles: Record<SealRingStatus, string> = {
  good: 'bg-teaGreen-50 text-teaGreen-700 border-teaGreen-200',
  normal: 'bg-amber-50 text-amber-700 border-amber-200',
  poor: 'bg-red-50 text-red-600 border-red-200',
};

const alertStyles: Record<string, string> = {
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-600 border-red-200',
};

export default function StatusBadge({ status, type = 'jar' }: StatusBadgeProps) {
  let label = status;
  let style = 'bg-gray-100 text-gray-600 border-gray-200';

  if (type === 'jar') {
    label = getStatusLabel(status);
    style = jarStatusStyles[status as JarStatus] || style;
  } else if (type === 'seal') {
    label = getSealLabel(status);
    style = sealStatusStyles[status as SealRingStatus] || style;
  } else if (type === 'alert') {
    label = status === 'warning' ? '注意' : '紧急';
    style = alertStyles[status] || style;
  }

  return (
    <span className={`status-badge border ${style}`}>
      {label}
    </span>
  );
}
