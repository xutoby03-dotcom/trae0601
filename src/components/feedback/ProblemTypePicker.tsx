import { Check } from 'lucide-react';
import { ProblemType, ProblemTypeLabel } from '@/types';
import { cn } from '@/lib/utils';

interface ProblemTypePickerProps {
  selected: ProblemType[];
  onChange: (types: ProblemType[]) => void;
}

const typeStyles: Record<ProblemType, { bg: string; border: string; text: string }> = {
  pattern: { bg: 'bg-charcoal-100', border: 'border-charcoal-500', text: 'text-charcoal-700' },
  fabric: { bg: 'bg-cream-200', border: 'border-cream-400', text: 'text-charcoal-700' },
  workmanship: { bg: 'bg-champagne-200', border: 'border-champagne-500', text: 'text-charcoal-700' },
  comfort: { bg: 'bg-terracotta-100', border: 'border-terracotta-500', text: 'text-terracotta-700' },
};

const types: ProblemType[] = ['pattern', 'fabric', 'workmanship', 'comfort'];

export default function ProblemTypePicker({
  selected,
  onChange,
}: ProblemTypePickerProps) {
  const toggle = (type: ProblemType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => {
        const isSelected = selected.includes(type);
        const style = typeStyles[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={cn(
              'relative flex items-center justify-center py-4 px-4 rounded-lg border-2 transition-all duration-200',
              style.bg,
              style.text,
              isSelected
                ? `${style.border} shadow-md`
                : 'border-transparent hover:opacity-90'
            )}
          >
            <span className="font-medium">{ProblemTypeLabel[type]}</span>
            {isSelected && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
