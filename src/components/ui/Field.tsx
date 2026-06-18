import { cn } from '@/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

type BaseProps = {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  prefixIcon?: ReactNode;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, hint, className, id, prefixIcon, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center pointer-events-none text-slate-400">
            {prefixIcon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full rounded-lg border text-sm transition-all duration-200',
            'bg-white focus:outline-none focus:ring-2',
            prefixIcon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200 resize-y',
          'bg-white focus:outline-none focus:ring-2',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { prefixIcon?: ReactNode };

export function Select({ label, error, hint, className, id, children, prefixIcon, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 flex items-center">
            {prefixIcon}
          </div>
        )}
        <select
          id={id}
          className={cn(
            'w-full rounded-lg border text-sm transition-all duration-200 appearance-none',
            'bg-white focus:outline-none focus:ring-2 pr-10',
            prefixIcon ? 'pl-9 py-2.5' : 'px-3.5 py-2.5',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
