import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ChefHat, Trash2 } from 'lucide-react'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useIngredientStore } from '@/store/useIngredientStore'
import { recipes } from '@/data/recipes'
import { matchRecipes } from '@/utils/recommend'

export default function Favorites() {
  const navigate = useNavigate()
  const favorites = useFavoriteStore((s) => s.favorites)
  const removeFavorite = useFavoriteStore((s) => s.removeFavorite)
  const ingredients = useIngredientStore((s) => s.ingredients)

  const activeIngredients = ingredients.filter((i) => !i.excluded)
  const matchMap = new Map(
    matchRecipes(activeIngredients, undefined, favorites).map((m) => [m.recipe.id, m])
  )

  const favoriteRecipes = favorites
    .map((fav) => {
      const recipe = recipes.find((r) => r.id === fav.recipeId)
      return recipe ? { ...fav, recipe } : null
    })
    .filter(Boolean) as (typeof favorites[number] & { recipe: typeof recipes[number] })[]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="text-red-400" size={22} fill="currentColor" />
              <h1 className="text-lg font-serif">我的收藏</h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-orange-400 transition-colors"
          >
            <ChefHat size={16} />
            回到首页
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {favoriteRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-stone-400 text-lg">还没有收藏的菜谱</p>
            <p className="text-stone-600 text-sm mt-2">在做菜时收藏成功的菜谱，下次类似食材直接推荐</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full text-sm"
            >
              开始找菜谱
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteRecipes.map((fav) => {
              const matchData = matchMap.get(fav.recipeId)
              const matchScore = matchData ? matchData.matchScore : null
              return (
                <div
                  key={fav.id}
                  className="bg-stone-900 rounded-2xl p-5 border border-stone-800 hover:border-orange-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => navigate(`/recipe/${fav.recipeId}`)}
                      className="flex-1 text-left flex items-center gap-3"
                    >
                      <span className="text-3xl">{fav.recipe.emoji}</span>
                      <div>
                        <h3 className="text-stone-100 font-serif text-lg group-hover:text-orange-400 transition-colors">
                          {fav.recipe.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-stone-500">
                            收藏于 {new Date(fav.savedAt).toLocaleDateString('zh-CN')}
                          </span>
                          {fav.ingredientSnapshot.length > 0 && (
                            <span className="text-xs text-stone-600">
                              当时食材：{fav.ingredientSnapshot.slice(0, 3).join('、')}
                              {fav.ingredientSnapshot.length > 3 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-3">
                      {matchScore !== null && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-500">{matchScore}%</div>
                          <div className="text-xs text-stone-500">当前匹配</div>
                        </div>
                      )}
                      <button
                        onClick={() => removeFavorite(fav.recipeId)}
                        className="p-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="取消收藏"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
