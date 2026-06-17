import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 border rounded-xl transition-all duration-200 appearance-none bg-white pr-10',
              'focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/50 focus:border-[#4A90D9]',
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-200 hover:border-gray-300',
              className
            )
          )}
          {...props}
        >
          <option value="">请选择</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
