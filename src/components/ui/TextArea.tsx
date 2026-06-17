import React from 'react';
import { cn } from '@/utils/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className,
  rows = 3,
  id,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
          'bg-white text-gray-800 placeholder:text-gray-400',
          'focus:outline-none focus:ring-0',
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-gray-200 focus:border-[#4A90D9] hover:border-gray-300',
          'resize-none',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
