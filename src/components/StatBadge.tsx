import type { WaxStatus } from '@/types';
import { STATUS_META } from '@/utils/constants';
import { cn } from '@/utils/helpers';

interface StatBadgeProps {
  status: WaxStatus;
  count: number;
  active?: boolean;
}

export default function StatBadge({ status, count, active }: StatBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200',
        active
          ? 'bg-ink-800/80 border border-gold-600/50 shadow-gold-sm'
          : 'bg-ink-800/40 border border-ink-700/60',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', meta.dotColor, 'animate-pulse')} />
      <span className={cn('text-sm font-serif', meta.color)}>{meta.label}</span>
      <span
        className={cn(
          'min-w-[22px] text-center px-1.5 py-0.5 rounded-md text-xs font-mono font-semibold',
          count > 0
            ? `bg-gradient-to-br ${meta.accent} ${meta.color}`
            : 'bg-ink-700/50 text-ink-500',
        )}
      >
        {count}
      </span>
    </div>
  );
}
