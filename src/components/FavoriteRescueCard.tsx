import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight, AlertTriangle } from 'lucide-react'
import { recipes } from '@/data/recipes'
import type { FavoriteRescue } from '@/types'

export default function FavoriteRescueCard({ rescue }: { rescue: FavoriteRescue }) {
  const navigate = useNavigate()
  const recipe = recipes.find((r) => r.id === rescue.recipeId)
  if (!recipe) return null

  return (
    <button
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="w-full text-left bg-gradient-to-r from-orange-500/10 to-stone-900 rounded-2xl p-4 border border-orange-500/20 hover:border-orange-500/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{recipe.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-red-400 shrink-0" fill="currentColor" />
              <h3 className="text-stone-100 font-serif text-base group-hover:text-orange-400 transition-colors truncate">
                {recipe.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span>上次食材：{rescue.snapshotIngredients.join('、')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className="text-lg font-bold text-orange-500">{rescue.similarity}%</div>
          <div className="text-[10px] text-stone-500">食材相似</div>
        </div>
      </div>

      {rescue.missingNow.length > 0 && (
        <div className="mt-2 pt-2 border-t border-orange-500/10 flex items-start gap-1.5 text-xs">
          <AlertTriangle size={12} className="text-orange-400 shrink-0 mt-0.5" />
          <span className="text-orange-400">
            这次差：{rescue.missingNow.join('、')}
          </span>
        </div>
      )}

      <div className="flex items-center justify-end mt-1.5 text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
        查看详情 <ArrowRight size={12} className="ml-0.5" />
      </div>
    </button>
  )
}
