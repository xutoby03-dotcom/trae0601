import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
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
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 border rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/50 focus:border-[#4A90D9]',
              icon ? 'pl-10' : '',
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-200 hover:border-gray-300 bg-white',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
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
      <textarea
        id={inputId}
        className={twMerge(
          clsx(
            'w-full px-4 py-2.5 border rounded-xl transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/50 focus:border-[#4A90D9]',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500'
              : 'border-gray-200 hover:border-gray-300 bg-white',
            className
          )
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
