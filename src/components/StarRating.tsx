import { Star } from 'lucide-react';

interface Props {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export default function StarRating({ rating, onChange, readonly = false, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (readonly) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${sizeClass} ${i <= rating ? 'text-caution-500 fill-caution-500' : 'text-night-500'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className="p-1 -m-1 rounded-lg transition-colors hover:bg-night-700"
        >
          <Star
            className={`${sizeClass} transition-colors ${
              i <= rating ? 'text-caution-500 fill-caution-500' : 'text-night-500 hover:text-night-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
