import { FeelLevel, FeelLabel } from '@/types';
import { getFeelColor } from '@/utils/format';
import { cn } from '@/lib/utils';

interface FeelSliderProps {
  value: FeelLevel;
  onChange: (v: FeelLevel) => void;
  label: string;
  note?: string;
  onNoteChange?: (v: string) => void;
}

export default function FeelSlider({
  value,
  onChange,
  label,
  note,
  onNoteChange,
}: FeelSliderProps) {
  const levels: FeelLevel[] = [1, 2, 3];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal-700">{label}</label>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-all duration-200',
              value === level
                ? getFeelColor(level) + ' border-current shadow-sm'
                : 'bg-white text-charcoal-500 border-cream-200 hover:border-charcoal-300 hover:text-charcoal-700'
            )}
          >
            {FeelLabel[level]}
          </button>
        ))}
      </div>
      {onNoteChange && (
        <input
          type="text"
          value={note || ''}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="补充说明（可选）"
          className="w-full px-3 py-2 text-sm border border-cream-200 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal-300 focus:border-transparent bg-cream-50"
        />
      )}
    </div>
  );
}
