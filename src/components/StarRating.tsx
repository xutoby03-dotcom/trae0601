import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }: Props) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          disabled={readOnly}
          className={`${!readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star
            className={`${starSize} transition-colors ${
              rating <= value
                ? 'fill-warning-400 text-warning-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
