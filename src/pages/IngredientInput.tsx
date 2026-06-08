import { useNavigate } from 'react-router-dom'
import { ChefHat, ArrowRight } from 'lucide-react'
import IngredientForm from '@/components/IngredientForm'
import IngredientCard from '@/components/IngredientCard'
import { useIngredientStore } from '@/store/useIngredientStore'

export default function IngredientInput() {
  const ingredients = useIngredientStore((s) => s.ingredients)
  const navigate = useNavigate()
  const activeCount = ingredients.filter((i) => !i.excluded).length

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="text-orange-500" size={28} />
            <div>
              <h1 className="text-xl font-serif text-stone-100">剩料救场助手</h1>
              <p className="text-xs text-stone-500">冰箱里剩什么，就做什么</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/favorites')}
            className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
          >
            我的收藏
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section>
          <IngredientForm />
        </section>

        {ingredients.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-stone-300 font-serif flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full" />
                冰箱食材
                <span className="text-sm text-stone-500">({activeCount}种可用)</span>
              </h2>
              {activeCount > 0 && (
                <button
                  onClick={() => navigate('/recommend')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-colors"
                >
                  开始推荐
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <IngredientCard key={ing.id} ingredient={ing} />
              ))}
            </div>
          </section>
        )}

        {ingredients.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🧊</div>
            <p className="text-stone-500 text-lg">冰箱空空的，先加点食材吧</p>
            <p className="text-stone-600 text-sm mt-2">把你手头剩的食材都丢进来</p>
          </div>
        )}
      </main>
    </div>
  )
}
