import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer select-none',
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
              checked
                ? 'bg-primary-600 border-primary-600'
                : 'bg-white border-gray-300 hover:border-primary-400'
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
