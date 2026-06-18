import { cn } from '@/utils/helpers';
import type { TaskStatus, TaskPriority } from '@/types';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '@/utils/constants';

type BadgeType = 'status' | 'priority';

interface StatusBadgeProps {
  type: BadgeType;
  value: TaskStatus | TaskPriority;
  className?: string;
}

export default function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const labels = type === 'status' ? TASK_STATUS_LABELS : TASK_PRIORITY_LABELS;
  const colors = type === 'status' ? TASK_STATUS_COLORS : TASK_PRIORITY_COLORS;

  return (
    <span className={cn('badge', colors[value as keyof typeof colors], className)}>
      {labels[value as keyof typeof labels]}
    </span>
  );
}
