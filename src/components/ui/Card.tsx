import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl shadow-sm border border-gray-100',
          hoverable && 'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card
