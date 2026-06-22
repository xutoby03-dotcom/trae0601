import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
  readOnly?: boolean;
}

export default function RatingInput({
  value,
  onChange,
  label,
  description,
  readOnly = false,
}: RatingInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="text-sm text-cyan-400 font-semibold">{value}/5</span>
      </div>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={readOnly ? 'button' : 'button'}
            onClick={() => !readOnly && onChange(star)}
            disabled={readOnly}
            className={`p-1 transition-all duration-200 ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`${label} ${star}星`}
          >
            <Star
              size={24}
              className={`transition-colors duration-200 ${
                star <= value
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
