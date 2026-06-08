import { Clock, Flame, AlertTriangle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { RecipeMatch } from '@/types'

const DIFFICULTY_LABELS = { easy: '简单', medium: '中等', hard: '困难' }
const DIFFICULTY_STARS = { easy: 1, medium: 2, hard: 3 }

export default function RecipeCard({ match }: { match: RecipeMatch }) {
  const navigate = useNavigate()
  const { recipe, matchScore, missingIngredients, substitutableIngredients, shortIngredients } = match
  const requiredMissing = missingIngredients.filter((i) => i.required)
  const optionalMissing = missingIngredients.filter((i) => !i.required)

  return (
    <button
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="w-full text-left bg-stone-900 rounded-2xl p-5 border border-stone-800 hover:border-orange-500/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{recipe.emoji}</span>
          <div>
            <h3 className="text-stone-100 font-serif text-lg group-hover:text-orange-400 transition-colors">
              {recipe.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-stone-400">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {recipe.cookTime}分钟
              </span>
              <span className="flex items-center gap-1">
                <Flame size={14} />
                {Array(DIFFICULTY_STARS[recipe.difficulty]).fill('🔥').join('')}
                {DIFFICULTY_LABELS[recipe.difficulty]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold text-orange-500">{matchScore}%</div>
          <div className="text-xs text-stone-500">匹配度</div>
        </div>
      </div>

      {(requiredMissing.length > 0 || shortIngredients.length > 0 || substitutableIngredients.length > 0) && (
        <div className="mt-3 pt-3 border-t border-stone-800 space-y-1.5">
          {requiredMissing.length > 0 && (
            <div className="flex items-start gap-1.5 text-sm">
              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-red-400">
                缺：{requiredMissing.map((i) => `${i.ingredientName}${i.amount}${i.unit}`).join('、')}
              </span>
            </div>
          )}
          {shortIngredients.length > 0 && (
            <div className="flex items-start gap-1.5 text-sm">
              <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
              <span className="text-orange-400">
                量不足：{shortIngredients.map((s) => `${s.ingredientName}差${s.shortage}${s.unit}`).join('、')}
              </span>
            </div>
          )}
          {substitutableIngredients.length > 0 && (
            <div className="flex items-start gap-1.5 text-sm">
              <ArrowRight size={14} className="text-yellow-400 shrink-0 mt-0.5" />
              <span className="text-yellow-400">
                可替换：{substitutableIngredients.map((i) => `${i.ingredientName}→${i.substitute}`).join('、')}
              </span>
            </div>
          )}
        </div>
      )}

      {optionalMissing.length > 0 && (
        <div className="mt-2 text-xs text-stone-600">
          可选缺：{optionalMissing.map((i) => i.ingredientName).join('、')}
        </div>
      )}

      <div className="flex items-center justify-end mt-3 text-sm text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
        查看详情 <ArrowRight size={14} className="ml-1" />
      </div>
    </button>
  )
}
