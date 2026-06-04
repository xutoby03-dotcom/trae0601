import { Calendar } from 'lucide-react';
import type { FormField } from '../../types/form';

interface DateFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function DateField({ field, value = '', onChange, disabled }: DateFieldProps) {
  return (
    <div className="relative w-full">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
    </div>
  );
}
