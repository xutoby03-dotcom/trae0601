import { Star } from 'lucide-react';
import type { FormField } from '../../types/form';

interface RatingFieldProps {
  field: FormField;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function RatingField({ field, value = 0, onChange, disabled }: RatingFieldProps) {
  const maxStars = field.max ?? 5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange?.(star)}
          disabled={disabled}
          className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Star
            size={32}
            className={`transition-colors ${
              star <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-200 hover:text-yellow-200'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-gray-500 text-sm">
        {value > 0 ? `${value} / ${maxStars}` : `最高 ${maxStars} 星`}
      </span>
    </div>
  );
}
