import { Circle, CircleDot } from 'lucide-react';
import type { FormField } from '../../types/form';

interface RadioFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function RadioField({ field, value = '', onChange, disabled }: RadioFieldProps) {
  if (!field.options || field.options.length === 0) {
    return <div className="text-gray-400 text-sm">暂无选项</div>;
  }

  return (
    <div className="space-y-3">
      {field.options.map((option) => {
        const isChecked = value === option.value;
        return (
          <label
            key={option.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              isChecked
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name={field.id}
              value={option.value}
              checked={isChecked}
              onChange={() => !disabled && onChange?.(option.value)}
              disabled={disabled}
              className="sr-only"
            />
            {isChecked ? (
              <CircleDot className="text-blue-600 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-300 flex-shrink-0" size={20} />
            )}
            <span className={`${isChecked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
