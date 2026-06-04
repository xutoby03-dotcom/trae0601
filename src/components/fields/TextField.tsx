import type { FormField } from '../../types/form';

interface TextFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function TextField({ field, value = '', onChange, disabled }: TextFieldProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
