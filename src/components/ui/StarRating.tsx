import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const value = index + 1;
        const isFilled = rating >= value;
        const isHalf = rating >= value - 0.5 && rating < value;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            disabled={!interactive}
            className={cn(
              'relative transition-transform',
              interactive && 'hover:scale-110 cursor-pointer'
            )}
          >
            <Star
              size={size}
              className={cn(
                'transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-transparent text-gray-300'
              )}
            />
            {isHalf && !isFilled && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star
                  size={size}
                  className="fill-amber-400 text-amber-400"
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
