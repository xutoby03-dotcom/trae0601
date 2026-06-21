import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function RatingStars({
  value,
  max = 10,
  onChange,
  readOnly = false,
  size = 'md',
  color = 'text-cyan-glow',
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => !readOnly && onChange?.(i + 1)}
            className={cn(
              'transition-transform',
              !readOnly && 'cursor-pointer hover:scale-110',
              readOnly && 'cursor-default'
            )}
            disabled={readOnly}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled ? color : 'text-slate-600',
                filled && 'fill-current'
              )}
            />
          </button>
        );
      })}
      {!readOnly && (
        <span className="ml-2 text-sm text-slate-400 font-medium">{value}/{max}</span>
      )}
    </div>
  );
}
