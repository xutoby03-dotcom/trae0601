import type { ToolCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

const categoryStyles: Record<ToolCategory, string> = {
  electric: 'bg-blue-50 text-blue-600 border-blue-100',
  hand: 'bg-orange-50 text-orange-600 border-orange-100',
  measuring: 'bg-purple-50 text-purple-600 border-purple-100',
  garden: 'bg-grass-50 text-grass-700 border-grass-200',
  other: 'bg-gray-50 text-gray-600 border-gray-100',
}

interface CategoryBadgeProps {
  category: ToolCategory
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${categoryStyles[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
