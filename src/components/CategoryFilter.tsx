import { EquipmentCategory, CATEGORY_LABELS } from '../store/types'
import { Filter, Tent, Flame, Lightbulb, Armchair, Bed, Shield, Package } from 'lucide-react'

const CATEGORY_ICONS: Record<EquipmentCategory, React.ElementType> = {
  shelter: Tent,
  cooking: Flame,
  lighting: Lightbulb,
  furniture: Armchair,
  sleeping: Bed,
  safety: Shield,
  other: Package,
}

interface CategoryFilterProps {
  activeCategory: EquipmentCategory | null
  onCategoryChange: (cat: EquipmentCategory | null) => void
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = Object.keys(CATEGORY_LABELS) as EquipmentCategory[]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`rounded-full px-3 py-1.5 text-xs font-medium font-body transition-all duration-150 ${
          activeCategory === null
            ? 'bg-forest-600 text-white'
            : 'bg-white/60 text-gray-600 hover:bg-white/80'
        }`}
      >
        <span className="flex items-center gap-1">
          <Filter className="h-3 w-3" />
          全部
        </span>
      </button>
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat]
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium font-body transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-forest-600 text-white'
                : 'bg-white/60 text-gray-600 hover:bg-white/80'
            }`}
          >
            <span className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {CATEGORY_LABELS[cat]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
