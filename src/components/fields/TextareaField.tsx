import type { FormField } from '../../types/form';

interface TextareaFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function TextareaField({ field, value = '', onChange, disabled }: TextareaFieldProps) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
      />
    </div>
  );
}
