import { Minus, Plus } from 'lucide-react';
import type { FormField } from '../../types/form';

interface NumberFieldProps {
  field: FormField;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function NumberField({ field, value, onChange, disabled }: NumberFieldProps) {
  const numValue = value ?? 0;
  const min = field.min ?? 0;
  const max = field.max ?? 100;

  const handleChange = (newValue: number) => {
    if (newValue >= min && newValue <= max) {
      onChange?.(newValue);
    }
  };

  const increment = () => handleChange(numValue + 1);
  const decrement = () => handleChange(numValue - 1);

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || numValue <= min}
        className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={18} className="text-gray-600" />
      </button>
      <input
        type="number"
        value={numValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        min={min}
        max={max}
        disabled={disabled}
        className="flex-1 px-4 py-3 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled || numValue >= max}
        className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={18} className="text-gray-600" />
      </button>
    </div>
  );
}
