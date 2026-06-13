import { Star } from 'lucide-react';
import type { StrengthLevel } from '@/types';

interface Props {
  level: StrengthLevel;
  size?: number;
}

export default function StrengthStars({ level, size = 16 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= level
              ? 'text-warn-500 fill-warn-500'
              : 'text-parchment-300'
          }
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}
