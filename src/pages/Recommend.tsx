import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChefHat, Heart } from 'lucide-react'
import PreferenceSelector from '@/components/PreferenceSelector'
import RecipeCard from '@/components/RecipeCard'
import FavoriteRescueCard from '@/components/FavoriteRescueCard'
import { useIngredientStore } from '@/store/useIngredientStore'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { matchRecipes, matchFavoriteRescues } from '@/utils/recommend'
import { recipes } from '@/data/recipes'
import type { Preference } from '@/types'

export default function Recommend() {
  const ingredients = useIngredientStore((s) => s.ingredients)
  const favorites = useFavoriteStore((s) => s.favorites)
  const navigate = useNavigate()
  const [preference, setPreference] = useState<Preference | null>(null)

  const activeIngredients = ingredients.filter((i) => !i.excluded)
  const matches = matchRecipes(activeIngredients, preference || undefined, favorites)
  const rescues = matchFavoriteRescues(ingredients, favorites)
    .filter((r) => recipes.some((rp) => rp.id === r.recipeId))

  if (activeIngredients.length === 0) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤷</div>
          <p className="text-stone-400 text-lg mb-4">还没有添加食材</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-orange-500 text-white rounded-full"
          >
            去添加
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="text-orange-500" size={24} />
            <h1 className="text-lg font-serif">推荐菜谱</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {rescues.length > 0 && (
          <section>
            <h2 className="text-stone-300 font-serif mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-400 rounded-full" />
              <Heart size={16} className="text-red-400" fill="currentColor" />
              救场收藏
              <span className="text-sm text-stone-500">({rescues.length}道)</span>
            </h2>
            <div className="space-y-2">
              {rescues.map((rescue) => (
                <FavoriteRescueCard key={rescue.recipeId} rescue={rescue} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-stone-300 font-serif mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full" />
            今天想吃什么口味？
          </h2>
          <PreferenceSelector value={preference} onChange={setPreference} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-stone-300 font-serif flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full" />
              为你推荐
              <span className="text-sm text-stone-500">({matches.length}道)</span>
            </h2>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <RecipeCard key={match.recipe.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🍳</div>
              <p className="text-stone-400">没有找到合适的菜谱</p>
              <p className="text-stone-600 text-sm mt-1">试试换个口味偏好，或者添加更多食材</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
