import type { TagName } from '@/types'
import { TAG_CONFIG } from '@/types'

interface TagBadgeProps {
  name: TagName
  selected?: boolean
  onClick?: () => void
}

export default function TagBadge({ name, selected, onClick }: TagBadgeProps) {
  const config = TAG_CONFIG[name]

  return (
    <span
      onClick={onClick}
      className={`tag-pill ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        color: config.color,
        backgroundColor: selected ? config.color : config.bg,
        ...(selected ? { boxShadow: `0 0 0 2px ${config.color}` } : {}),
      }}
    >
      <span>{config.emoji}</span>
      <span className={selected ? 'text-white' : ''}>{name}</span>
    </span>
  )
}
