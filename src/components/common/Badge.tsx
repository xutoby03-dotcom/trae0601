import { cn } from '@/lib/utils';
import type { Priority, TaskStatus, TaskCategory } from '@/types';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from '@/types';

interface BadgeProps {
  variant?: 'priority' | 'status' | 'category';
  value: Priority | TaskStatus | TaskCategory;
  className?: string;
}

export function Badge({ variant, value, className }: BadgeProps) {
  const getStyles = () => {
    if (variant === 'priority') {
      const styles: Record<Priority, string> = {
        high: 'bg-wine/10 text-wine border-wine/20',
        medium: 'bg-rose-gold/15 text-rose-gold-dark border-rose-gold/30',
        low: 'bg-warm-100 text-warm-600 border-warm-200',
      };
      return styles[value as Priority];
    }
    if (variant === 'status') {
      const styles: Record<TaskStatus, string> = {
        pending: 'bg-warm-100 text-warm-600 border-warm-200',
        claimed: 'bg-blue-50 text-blue-600 border-blue-200',
        confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
        completed: 'bg-wine/10 text-wine border-wine/20',
      };
      return styles[value as TaskStatus];
    }
    if (variant === 'category') {
      const styles: Record<TaskCategory, string> = {
        pickup: 'bg-pink-50 text-pink-600 border-pink-200',
        ceremony: 'bg-wine/10 text-wine border-wine/20',
        banquet: 'bg-amber-50 text-amber-700 border-amber-200',
        logistics: 'bg-blue-50 text-blue-600 border-blue-200',
        photo: 'bg-purple-50 text-purple-600 border-purple-200',
        other: 'bg-warm-100 text-warm-600 border-warm-200',
      };
      return styles[value as TaskCategory];
    }
    return '';
  };

  const getLabel = () => {
    if (variant === 'priority') return PRIORITY_LABELS[value as Priority];
    if (variant === 'status') return STATUS_LABELS[value as TaskStatus];
    if (variant === 'category') return CATEGORY_LABELS[value as TaskCategory];
    return value;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border',
        getStyles(),
        className
      )}
    >
      {variant === 'priority' && value === 'high' && (
        <span className="w-1.5 h-1.5 rounded-full bg-wine mr-1.5 animate-pulse" />
      )}
      {getLabel()}
    </span>
  );
}
