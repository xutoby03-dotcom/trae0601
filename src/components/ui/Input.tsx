import { InputHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type InputType = 'text' | 'number' | 'date' | 'tel' | 'email';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  placeholder?: string;
  type?: InputType;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, placeholder, type = 'text', className, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-background text-foreground',
            'placeholder:text-muted-foreground transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-border hover:border-primary/50',
            className
          )}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
