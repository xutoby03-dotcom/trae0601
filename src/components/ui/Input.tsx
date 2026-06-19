import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 rounded-lg border bg-white text-sm transition-colors duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
