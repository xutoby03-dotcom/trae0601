import { EMOTION_COLORS } from '@/types'
import { cn } from '@/lib/utils'

interface EmotionTagProps {
  emotion: string
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function EmotionTag({ emotion, selected = false, onClick, size = 'md' }: EmotionTagProps) {
  const colorClasses = EMOTION_COLORS[emotion] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        colorClasses,
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1',
        selected && 'ring-2 ring-amber-primary/50 opacity-90',
        onClick && 'cursor-pointer hover:scale-105 transition',
      )}
    >
      {emotion}
    </span>
  )
}
