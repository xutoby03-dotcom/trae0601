import type { DrinkType } from '@/types'
import { DRINK_TYPE_CONFIG } from '@/types'
import { Droplets, Coffee, Leaf, GlassWater, Citrus, MilkOff } from 'lucide-react'

const DRINK_ICONS: Record<DrinkType, React.ReactNode> = {
  water: <Droplets size={24} />,
  coffee: <Coffee size={24} />,
  tea: <Leaf size={24} />,
  soda: <GlassWater size={24} />,
  juice: <Citrus size={24} />,
  milk: <MilkOff size={24} />,
}

interface DrinkTypeSelectorProps {
  value: DrinkType
  onChange: (type: DrinkType) => void
}

export default function DrinkTypeSelector({ value, onChange }: DrinkTypeSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {(Object.keys(DRINK_TYPE_CONFIG) as DrinkType[]).map((type) => {
        const config = DRINK_TYPE_CONFIG[type]
        const isSelected = value === type
        return (
          <button
            key={type}
            className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-300 min-w-[72px] btn-ripple ${
              isSelected
                ? 'shadow-md scale-105'
                : 'bg-white/50 hover:bg-white/80 hover:shadow-sm'
            }`}
            style={{
              borderColor: isSelected ? config.color : 'transparent',
              borderWidth: '2px',
              background: isSelected ? `${config.color}15` : undefined,
            }}
            onClick={() => onChange(type)}
          >
            <div style={{ color: config.color }}>{DRINK_ICONS[type]}</div>
            <span className="text-xs font-medium font-display" style={{ color: isSelected ? config.color : '#666' }}>
              {config.label}
            </span>
            <span className="text-[10px] text-gray-400">
              {Math.round(config.ratio * 100)}%
            </span>
          </button>
        )
      })}
    </div>
  )
}
