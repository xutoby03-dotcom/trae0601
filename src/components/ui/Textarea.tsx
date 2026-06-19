import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, rows = 4, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white text-sm transition-colors duration-200 resize-y',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'border-gray-300 hover:border-gray-400',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
          )}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
