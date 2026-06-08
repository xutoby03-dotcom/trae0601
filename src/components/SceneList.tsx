import type { SceneType, EquipmentCategory } from '../store/types'
import { CATEGORY_LABELS } from '../store/types'
import { Plus, Check } from 'lucide-react'

interface SceneListProps {
  recommendedItems: { category: EquipmentCategory; itemNames: string[] }[]
  equipmentNames: string[]
  onAddItem: (name: string) => void
}

export function SceneList({ recommendedItems, equipmentNames, onAddItem }: SceneListProps) {
  return (
    <div className="space-y-4">
      {recommendedItems.map((group) => (
        <div key={group.category}>
          <h4 className="font-display text-sm font-semibold text-earth-500 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-earth-400" />
            {CATEGORY_LABELS[group.category]}
          </h4>
          <div className="space-y-1 pl-3">
            {group.itemNames.map((name) => {
              const exists = equipmentNames.some(
                (en) => en.includes(name.replace(/[\(\)（）]/g, '').slice(0, 2))
              )
              return (
                <div
                  key={name}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-cream-200/60 transition-colors"
                >
                  <span className="text-sm text-gray-700">{name}</span>
                  {exists ? (
                    <span className="flex items-center gap-1 text-xs text-forest-500">
                      <Check className="w-3 h-3" />
                      已有
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddItem(name)}
                      className="flex items-center gap-1 text-xs text-sunset-500 hover:text-sunset-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      添加
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
