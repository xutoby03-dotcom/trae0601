import { Mountain, Waves, Baby, type LucideIcon } from 'lucide-react'
import type { SceneTemplate } from '../store/types'

const ICON_MAP: Record<string, LucideIcon> = {
  Mountain,
  Waves,
  Baby,
}

interface SceneCardProps {
  template: SceneTemplate
  onSelect: (template: SceneTemplate) => void
  isSelected: boolean
}

export function SceneCard({ template, onSelect, isSelected }: SceneCardProps) {
  const Icon = ICON_MAP[template.icon] || Mountain

  return (
    <button
      onClick={() => onSelect(template)}
      className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 text-left w-full ${
        isSelected
          ? 'border-forest-500 bg-forest-50 shadow-md scale-[1.02]'
          : 'border-cream-300 bg-white/60 hover:border-earth-300 hover:shadow-sm hover:scale-[1.01]'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
          isSelected ? 'bg-forest-600 text-white' : 'bg-cream-200 text-earth-500'
        }`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-lg font-semibold text-forest-700 mb-1">
        {template.name}
      </h3>
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        {template.description}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {template.requiredCategories.map((cat) => (
          <span
            key={cat}
            className="text-[10px] px-2 py-0.5 rounded-full bg-earth-100 text-earth-600"
          >
            {cat}
          </span>
        ))}
      </div>
    </button>
  )
}
