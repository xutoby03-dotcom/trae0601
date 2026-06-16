import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  wrapperClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, wrapperClassName, id, checked, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <label
        htmlFor={inputId}
        className={cn('inline-flex cursor-pointer items-center gap-2', wrapperClassName)}
      >
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded border-2 transition-colors',
              'peer-focus:ring-2 peer-focus:ring-primary-500/20',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              checked
                ? 'border-primary-500 bg-primary-500'
                : 'border-gray-300 bg-white hover:border-primary-400',
              className,
            )}
          >
            {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
