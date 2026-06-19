import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
      outline: 'border border-primary-700 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button
