import { Star } from 'lucide-react';

interface StarRatingProps {
  value: 1 | 2 | 3 | 4 | 5;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showLabel?: boolean;
}

const smellLabels: Record<number, string> = {
  1: '无异味',
  2: '轻微',
  3: '明显',
  4: '较重',
  5: '非常臭',
};

const StarRating = ({
  value,
  onChange,
  size = 'md',
  interactive = false,
  showLabel = true,
}: StarRatingProps) => {
  const sizeMap = { sm: 14, md: 18, lg: 24 };
  const starSize = sizeMap[size];

  const getStarColor = (level: number) => {
    if (level <= 2) return '#A8C5A0';
    if (level <= 3) return '#E8C77A';
    return '#D4896A';
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(n as 1 | 2 | 3 | 4 | 5)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={starSize}
              fill={n <= value ? getStarColor(value) : 'none'}
              stroke={n <= value ? getStarColor(value) : '#D4CCC0'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <span
          className={`text-xs font-medium ${size === 'sm' ? '' : 'text-sm'}`}
          style={{ color: getStarColor(value) }}
        >
          {smellLabels[value]}
        </span>
      )}
    </div>
  );
};

export default StarRating;
