import { cn } from '@/lib/utils';

interface Props {
  value: number;
  max: number;
  color?: 'fire' | 'soup' | 'broth' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ value, max, color = 'fire', size = 'md', showLabel = false, className }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colorMap = {
    fire: 'bg-gradient-to-r from-fire-300 to-fire-500',
    soup: 'bg-gradient-to-r from-soup-300 to-soup-500',
    broth: 'bg-gradient-to-r from-broth-300 to-broth-500',
    green: 'bg-gradient-to-r from-green-300 to-green-500',
    red: 'bg-gradient-to-r from-red-300 to-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-broth-50 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-broth-500">
          <span>{value.toFixed(1)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
