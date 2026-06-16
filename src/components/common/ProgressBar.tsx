import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  status?: 'fresh' | 'warning' | 'danger' | 'expired';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const colorClasses = {
  fresh: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-orange-500 animate-pulse-slow',
  expired: 'bg-red-500',
};

export function ProgressBar({ value, status = 'fresh', size = 'md', showLabel }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      <div
        className={clsx(
          'w-full bg-slate-100 rounded-full overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[status]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{Math.round(clampedValue)}%</span>
          <span>剩余 {Math.round(100 - clampedValue)}%</span>
        </div>
      )}
    </div>
  );
}
