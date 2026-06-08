import { X, Ban } from 'lucide-react'
import type { Ingredient } from '@/types'
import { useIngredientStore } from '@/store/useIngredientStore'
import { getPriorityLabel, getExpiryCountdown, isExpiredSoon } from '@/utils/recommend'

export default function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const removeIngredient = useIngredientStore((s) => s.removeIngredient)
  const toggleExcluded = useIngredientStore((s) => s.toggleExcluded)
  const labels = getPriorityLabel(ingredient)
  const countdown = getExpiryCountdown(ingredient.expiryDate)
  const expired = isExpiredSoon(ingredient.expiryDate)

  return (
    <div
      className={`group relative flex items-center gap-3 bg-stone-900 rounded-xl px-4 py-3 border transition-all ${
        ingredient.excluded
          ? 'border-stone-700 opacity-50'
          : 'border-stone-800 hover:border-stone-700'
      }`}
    >
      <div className="flex flex-col gap-1">
        {labels.map((l, i) => (
          <div key={i} className={`w-1 h-3 rounded-full ${l.color}`} />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-stone-100 font-medium ${ingredient.excluded ? 'line-through text-stone-500' : ''}`}>
            {ingredient.name}
          </span>
          <span className="text-stone-400 text-sm">
            {ingredient.quantity}{ingredient.unit}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${expired ? 'text-red-400' : 'text-stone-500'}`}>
            {countdown}
          </span>
          <span className="text-xs text-stone-600">
            {ingredient.sizeTag === 'large' ? '📦' : ingredient.sizeTag === 'medium' ? '📋' : '🧂'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toggleExcluded(ingredient.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            ingredient.excluded
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-stone-800 text-stone-400 hover:text-stone-300'
          }`}
          title={ingredient.excluded ? '取消排除' : '排除此食材'}
        >
          <Ban size={14} />
        </button>
        <button
          onClick={() => removeIngredient(ingredient.id)}
          className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400 transition-colors"
          title="删除"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
