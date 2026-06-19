import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
      default: 'bg-gray-100 text-gray-700',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
