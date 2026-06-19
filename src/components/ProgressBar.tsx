import { cn } from '../lib/utils';
import { getStatusBgColor } from '../utils/calculations';
import { FilterStatus } from '../types';

interface ProgressBarProps {
  percent: number;
  status?: FilterStatus;
  showLabel?: boolean;
  className?: string;
  height?: string;
}

export function ProgressBar({
  percent,
  status = 'healthy',
  showLabel = true,
  className,
  height = 'h-2',
}: ProgressBarProps) {
  const displayPercent = Math.max(0, Math.min(100, percent));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500 font-medium">滤芯寿命</span>
          <span
            className={cn(
            'font-semibold',
            status === 'expired' ? 'text-red-600' :
            status === 'warning' ? 'text-amber-600' :
            'text-emerald-600'
          )}
          >
            {displayPercent.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', height)}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            getStatusBgColor(status)
          )}
          style={{ width: `${displayPercent}%` }}
        />
      </div>
    </div>
  );
}
