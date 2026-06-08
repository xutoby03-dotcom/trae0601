interface MoodTagProps {
  mood: string
  color: string
  emoji: string
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export default function MoodTag({ mood, color, emoji, active = false, onClick, size = 'md' }: MoodTagProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  const bgStyle = active
    ? { backgroundColor: `${color}20`, borderColor: color }
    : undefined

  const bgClass = active ? '' : 'bg-white/5 border-white/10'
  const activeClass = active ? 'scale-105' : ''

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border transition-all duration-200',
        sizeClass,
        bgClass,
        activeClass,
        onClick ? 'cursor-pointer hover:scale-105' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={bgStyle}
      onClick={onClick}
    >
      <span>{emoji}</span>
      <span>{mood}</span>
    </span>
  )
}
