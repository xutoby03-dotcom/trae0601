import { Star, Shirt, User } from 'lucide-react';

interface StarRatingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ score, maxScore = 5, size = 'md' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxScore }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < score
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200'
          } transition-all duration-300`}
        />
      ))}
    </div>
  );
}

interface ScoreDisplayProps {
  skinScore: number;
  clothScore: number;
}

export function ScoreDisplay({ skinScore, clothScore }: ScoreDisplayProps) {
  const avgScore = ((skinScore + clothScore) / 2).toFixed(1);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center ring-1 ring-amber-100">
        <div className="mb-2 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <User className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <p className="text-xs font-medium text-amber-700">皮肤表现</p>
        <p className="mt-1 text-xl font-bold text-amber-900">{skinScore}</p>
        <div className="mt-1 flex justify-center">
          <StarRating score={skinScore} size="sm" />
        </div>
      </div>
      
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 text-center ring-1 ring-rose-100">
        <div className="mb-2 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Shirt className="h-5 w-5 text-rose-600" />
          </div>
        </div>
        <p className="text-xs font-medium text-rose-700">衣服表现</p>
        <p className="mt-1 text-xl font-bold text-rose-900">{clothScore}</p>
        <div className="mt-1 flex justify-center">
          <StarRating score={clothScore} size="sm" />
        </div>
      </div>
      
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-4 text-center ring-1 ring-violet-100">
        <div className="mb-2 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Star className="h-5 w-5 fill-violet-500 text-violet-600" />
          </div>
        </div>
        <p className="text-xs font-medium text-violet-700">综合评分</p>
        <p className="mt-1 text-xl font-bold text-violet-900">{avgScore}</p>
        <div className="mt-1 flex justify-center">
          <StarRating score={Math.round(Number(avgScore))} size="sm" />
        </div>
      </div>
    </div>
  );
}

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon: 'skin' | 'cloth';
}

export function ScoreInput({ value, onChange, label, icon }: ScoreInputProps) {
  return (
    <div className="rounded-xl bg-stone-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon === 'skin' ? (
          <User className="h-5 w-5 text-amber-600" />
        ) : (
          <Shirt className="h-5 w-5 text-rose-600" />
        )}
        <span className="font-medium text-stone-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="transform transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-all ${
                rating <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-stone-200 text-stone-200 hover:fill-amber-200 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-bold text-stone-700">{value}</span>
      </div>
    </div>
  );
}
