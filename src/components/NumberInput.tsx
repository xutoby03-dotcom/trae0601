import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  warning?: boolean;
  error?: boolean;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  warning,
  error,
}: NumberInputProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    } else {
      onChange(0);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={value <= min}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
            'bg-slate-100 hover:bg-slate-200 active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100'
          )}
        >
          <Minus className="w-4 h-4 text-slate-600" />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className={cn(
            'w-16 h-10 text-center text-lg font-bold font-mono rounded-lg border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-200'
              : warning
              ? 'border-amber-300 bg-amber-50 text-amber-700 focus:ring-amber-200'
              : 'border-slate-200 bg-white text-slate-800 focus:ring-blue-200 focus:border-blue-400'
          )}
        />
        <button
          type="button"
          onClick={handleIncrease}
          disabled={value >= max}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
            'bg-slate-100 hover:bg-slate-200 active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100'
          )}
        >
          <Plus className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
