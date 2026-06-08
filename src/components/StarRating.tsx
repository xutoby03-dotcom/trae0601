import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const filled = starIndex <= displayValue;

        return (
          <span
            key={starIndex}
            className={readonly ? '' : 'cursor-pointer'}
            onMouseEnter={() => { if (!readonly) setHovered(starIndex); }}
            onMouseLeave={() => { if (!readonly) setHovered(null); }}
            onClick={() => { if (!readonly && onChange) onChange(starIndex); }}
          >
            <Star
              size={20}
              className={`transition-colors duration-150 ${
                filled
                  ? 'fill-[#D4A574] text-[#D4A574]'
                  : 'fill-transparent text-gray-300'
              } ${!readonly ? 'hover:scale-110' : ''}`}
            />
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
