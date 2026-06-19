import { TextareaHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  rows?: number;
  placeholder?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, rows = 4, placeholder, className, ...props }, ref) => {
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
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-background text-foreground',
            'placeholder:text-muted-foreground transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'border-border hover:border-primary/50',
            className
          )}
          {...props}
        />
      </motion.div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
