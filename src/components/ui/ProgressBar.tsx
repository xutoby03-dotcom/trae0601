import { cn } from '@/utils/helpers';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  color, 
  size = 'md',
  showLabel = false,
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColorClass = () => {
    if (color) return color;
    if (percentage < 50) return 'bg-sage-400';
    if (percentage < 80) return 'bg-sky-400';
    if (percentage < 100) return 'bg-coral-400';
    return 'bg-coral-500';
  };

  return (
    <div className={cn('w-full', className)}>
      <div 
        className={cn(
          'w-full bg-warm-100 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            getColorClass()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-warm-500">
          <span>{value}/{max}</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
    </div>
  );
}
