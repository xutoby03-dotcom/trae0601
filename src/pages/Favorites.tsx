import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Clock, Star, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { ClothingType, Difficulty } from '@/types'

const typeIconMap: Record<ClothingType, string> = {
  '衬衫': '👔',
  '牛仔裤': '👖',
  '毛衣': '🧶',
  'T恤': '👕',
  '裙子': '👗',
  '外套': '🧥',
}

const difficultyConfig: Record<Difficulty, { color: string; bg: string; stars: number }> = {
  '简单': { color: 'text-sage-700', bg: 'bg-sage-100', stars: 1 },
  '中等': { color: 'text-terra-700', bg: 'bg-terra-100', stars: 2 },
  '困难': { color: 'text-red-700', bg: 'bg-red-100', stars: 3 },
}

export default function Favorites() {
  const ideas = useStore((s) => s.ideas)
  const clothing = useStore((s) => s.clothing)
  const materials = useStore((s) => s.materials)
  const toggleFavorite = useStore((s) => s.toggleFavorite)

  const favoriteIdeas = useMemo(
    () => ideas.filter(i => i.favorited),
    [ideas]
  )

  const getClothing = (clothingId: string) => clothing.find(c => c.id === clothingId)

  const getMissingMaterials = (materialIds: string[]) =>
    materialIds.map(id => materials.find(m => m.id === id)).filter(m => m && !m.owned)

  return (
    <div className="min-h-screen bg-cream-100 font-body pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sage-500 text-sm hover:text-terra-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回灵感板
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-sage-800 mb-2">
            收藏灵感
          </h1>
          <p className="text-sage-500 text-sm">
            你收藏的改造方案，随时可以开始动手
          </p>
        </motion.div>

        {favoriteIdeas.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {favoriteIdeas.map((idea, index) => {
                const item = getClothing(idea.clothingId)
                const missing = getMissingMaterials(idea.requiredMaterialIds)
                const diff = difficultyConfig[idea.difficulty]

                return (
                  <motion.div
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-200 to-terra-50 flex items-center justify-center shrink-0">
                        <span className="text-2xl">{item ? typeIconMap[item.type] : '👕'}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-display text-lg font-semibold text-sage-800">
                              {idea.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {item && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-sage-600 font-medium">
                                  {item.type}
                                </span>
                              )}
                              <span className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full',
                                diff.bg, diff.color
                              )}>
                                {idea.difficulty}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-sage-400">
                                <Clock className="w-3 h-3" />
                                {idea.estimatedTime}
                              </span>
                            </div>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => toggleFavorite(idea.id)}
                            className="p-1.5 shrink-0"
                          >
                            <Heart className="w-5 h-5 fill-red-400 text-red-400 transition-colors" />
                          </motion.button>
                        </div>

                        {missing.length > 0 && (
                          <div className="flex items-start gap-1.5 mt-3">
                            <AlertTriangle className="w-3.5 h-3.5 text-terra-400 mt-0.5 shrink-0" />
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs text-terra-500 font-medium">缺:</span>
                              {missing.map(m => (
                                <span
                                  key={m!.id}
                                  className="text-xs px-2 py-0.5 rounded-full bg-terra-50 text-terra-600 border border-terra-200"
                                >
                                  {m!.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {missing.length === 0 && (
                          <div className="flex items-center gap-1.5 mt-3">
                            <span className="text-xs text-sage-500">✅ 材料齐全，随时可以开工</span>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-cream-200/60 flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map(s => (
                              <Star
                                key={s}
                                className={cn(
                                  'w-3.5 h-3.5',
                                  s <= diff.stars
                                    ? 'text-terra-400 fill-terra-400'
                                    : 'text-cream-400'
                                )}
                              />
                            ))}
                          </div>
                          <Link
                            to={`/project/${idea.clothingId}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-terra-500 text-white text-xs font-medium shadow-soft hover:bg-terra-600 transition-colors"
                          >
                            查看详情
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mb-5">
              <Heart className="w-9 h-9 text-sage-300" />
            </div>
            <h3 className="font-display text-xl font-semibold text-sage-600 mb-2">
              还没有收藏灵感
            </h3>
            <p className="text-sage-400 text-sm max-w-xs text-center mb-6">
              在登记旧衣或改造工坊里点红心，收藏的方案会出现在这里
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terra-500 text-white text-sm font-medium shadow-card hover:bg-terra-600 transition-colors"
            >
              去登记旧衣
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
