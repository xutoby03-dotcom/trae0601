import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Flame, Heart, ArrowRight, AlertTriangle } from 'lucide-react'
import { recipes } from '@/data/recipes'
import { useIngredientStore } from '@/store/useIngredientStore'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { matchRecipes } from '@/utils/recommend'

const DIFFICULTY_LABELS = { easy: '简单', medium: '中等', hard: '困难' }

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ingredients = useIngredientStore((s) => s.ingredients)
  const favorites = useFavoriteStore((s) => s.favorites)
  const addFavorite = useFavoriteStore((s) => s.addFavorite)
  const removeFavorite = useFavoriteStore((s) => s.removeFavorite)

  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
        菜谱不存在
      </div>
    )
  }

  const activeIngredients = ingredients.filter((i) => !i.excluded)
  const matches = matchRecipes(activeIngredients, undefined, favorites)
  const match = matches.find((m) => m.recipe.id === recipe.id)

  const isFav = useFavoriteStore.getState().isFavorite(recipe.id)
  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(recipe.id)
    } else {
      addFavorite(
        recipe.id,
        activeIngredients.map((i) => i.name)
      )
    }
  }

  const ingredientRemainders = match?.ingredientRemainders || recipe.ingredients.map((ri) => {
    const userIng = activeIngredients.find(
      (i) => i.name.trim().toLowerCase() === ri.ingredientName.trim().toLowerCase()
    )
    return {
      name: ri.ingredientName,
      used: ri.amount,
      remaining: userIng ? Number(Math.max(0, userIng.quantity - ri.amount).toFixed(2)) : 0,
      unit: ri.unit,
      hasEnough: userIng ? userIng.quantity >= ri.amount : false,
    }
  })

  const missingRequired = recipe.ingredients.filter((ri) => {
    const userIng = activeIngredients.find(
      (i) => i.name.trim().toLowerCase() === ri.ingredientName.trim().toLowerCase()
    )
    const subIng = ri.substitute
      ? activeIngredients.find(
          (i) => i.name.trim().toLowerCase() === ri.substitute!.trim().toLowerCase()
        )
      : null
    return ri.required && !userIng && !subIng
  })

  const substitutable = recipe.ingredients.filter((ri) => {
    const userIng = activeIngredients.find(
      (i) => i.name.trim().toLowerCase() === ri.ingredientName.trim().toLowerCase()
    )
    const subIng = ri.substitute
      ? activeIngredients.find(
          (i) => i.name.trim().toLowerCase() === ri.substitute!.trim().toLowerCase()
        )
      : null
    return !userIng && subIng && ri.substitute
  })

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-serif flex items-center gap-2">
                <span className="text-2xl">{recipe.emoji}</span>
                {recipe.name}
              </h1>
              <div className="flex items-center gap-3 mt-0.5 text-sm text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {recipe.cookTime}分钟
                </span>
                <span className="flex items-center gap-1">
                  <Flame size={14} />
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-full transition-all ${
              isFav
                ? 'bg-red-500/20 text-red-400'
                : 'bg-stone-800 text-stone-400 hover:text-red-400'
            }`}
          >
            <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {missingRequired.length > 0 && (
          <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
              <AlertTriangle size={16} />
              缺少必要食材
            </div>
            <div className="space-y-1">
              {missingRequired.map((ri, i) => (
                <div key={i} className="text-sm text-red-300">
                  {ri.ingredientName} {ri.amount}{ri.unit}
                </div>
              ))}
            </div>
          </section>
        )}

        {substitutable.length > 0 && (
          <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
              <ArrowRight size={16} />
              可替换食材
            </div>
            <div className="space-y-1">
              {substitutable.map((ri, i) => (
                <div key={i} className="text-sm text-yellow-300">
                  {ri.ingredientName} → {ri.substitute} {ri.substituteAmount}{ri.substituteUnit}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-stone-300 font-serif mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full" />
            烹饪步骤
          </h2>
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-stone-800" />
            {recipe.steps.map((step, i) => (
              <div key={i} className="relative mb-6 last:mb-0">
                <div className="absolute -left-5 top-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-bold">
                  {i + 1}
                </div>
                <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
                  <p className="text-stone-200">{step.description}</p>
                  {step.time > 0 && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-stone-500">
                      <Clock size={12} />
                      约{step.time}分钟
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-stone-300 font-serif mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full" />
            食材消耗
          </h2>
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left text-stone-400 text-sm font-medium px-4 py-3">食材</th>
                  <th className="text-center text-stone-400 text-sm font-medium px-4 py-3">用量</th>
                  <th className="text-center text-stone-400 text-sm font-medium px-4 py-3">剩余</th>
                </tr>
              </thead>
              <tbody>
                {ingredientRemainders.map((item, i) => (
                  <tr key={i} className="border-b border-stone-800/50 last:border-0">
                    <td className="px-4 py-3 text-stone-200">{item.name}</td>
                    <td className="px-4 py-3 text-center text-stone-300">
                      {item.used}{item.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          item.remaining === 0
                            ? 'text-green-400'
                            : item.remaining > 0
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }
                      >
                        {item.remaining > 0 ? `${item.remaining}${item.unit}` : item.remaining === 0 ? '用完' : '不够'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="pb-8" />
      </main>
    </div>
  )
}
