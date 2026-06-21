import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InputSize = 'sm' | 'md';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  suffix?: ReactNode;
  unit?: string;
  size?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, unit, id, size = 'md', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-coffee-700 block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-lg border-2 transition-colors',
              'bg-white text-coffee-900 placeholder:text-coffee-300',
              'focus:outline-none',
              sizeClasses[size],
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-coffee-100 focus:border-coffee-700',
              unit && 'pr-12',
              suffix && 'pr-20',
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400 text-sm">
              {unit}
            </div>
          )}
          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-sm font-medium text-coffee-700', className)}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-coffee-700 block"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-colors appearance-none cursor-pointer',
            'bg-white text-coffee-900',
            'focus:outline-none',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%233E2723\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] bg-[length:1.5rem] pr-10',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-coffee-100 focus:border-coffee-700',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-coffee-700 block"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none',
            'bg-white text-coffee-900 placeholder:text-coffee-300',
            'focus:outline-none',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-coffee-100 focus:border-coffee-700',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
