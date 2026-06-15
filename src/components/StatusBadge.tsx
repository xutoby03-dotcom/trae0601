import type { FoodStatus } from '@/types';

interface StatusBadgeProps {
  status: FoodStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<FoodStatus, { label: string; className: string; icon: string }> = {
  frozen: {
    label: '冷冻中',
    className: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: '❄️',
  },
  thawing: {
    label: '解冻中',
    className: 'bg-secondary-50 text-secondary-600 border-secondary-200',
    icon: '💧',
  },
  cooked: {
    label: '已烹饪',
    className: 'bg-green-50 text-green-600 border-green-200',
    icon: '🍳',
  },
  returned: {
    label: '已放回',
    className: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    icon: '↩️',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.className} ${sizeClass}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
