import { ChevronDown } from 'lucide-react';
import type { FormField } from '../../types/form';

interface SelectFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function SelectField({ field, value = '', onChange, disabled }: SelectFieldProps) {
  if (!field.options || field.options.length === 0) {
    return <div className="text-gray-400 text-sm">暂无选项</div>;
  }

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-700 appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <option value="">{field.placeholder || '请选择'}</option>
        {field.options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
    </div>
  );
}
