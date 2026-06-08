import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md'
}

export default function StarRating({ rating, onChange, size = 'md' }: StarRatingProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!onChange}
        >
          <Star
            className={`${starSize} ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
