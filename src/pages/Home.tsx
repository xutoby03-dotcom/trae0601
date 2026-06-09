import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Star, Filter, ChevronDown, Sparkles, PackageOpen, Lightbulb, Heart } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { ClothingGroup, ClothingType, FabricType, Clothing } from '@/types'

const groupTabs: { key: ClothingGroup; label: string; icon: typeof Sparkles }[] = [
  { key: 'easy', label: '容易改', icon: Sparkles },
  { key: 'missing', label: '材料缺', icon: PackageOpen },
  { key: 'inspiration', label: '等灵感', icon: Lightbulb },
]

const clothingTypes: ClothingType[] = ['衬衫', '牛仔裤', '毛衣', 'T恤', '裙子', '外套']
const fabricTypes: FabricType[] = ['棉', '麻', '丝绸', '羊毛', '化纤', '混纺']

const typeIconMap: Record<ClothingType, string> = {
  '衬衫': '👔',
  '牛仔裤': '👖',
  '毛衣': '🧶',
  'T恤': '👕',
  '裙子': '👗',
  '外套': '🧥',
}

const difficultyStars: Record<string, number> = {
  '简单': 1,
  '中等': 2,
  '困难': 3,
}

const groupEmptyMessages: Record<ClothingGroup, { title: string; description: string }> = {
  easy: { title: '还没有容易改造的衣物', description: '登记一件旧衣，让AI帮你找到最简单的改造方案' },
  missing: { title: '材料齐全，无需等待', description: '你拥有的材料足够完成所有改造项目' },
  inspiration: { title: '灵感正在酝酿中', description: '先去登记旧衣吧，创意会自然涌现' },
}

export default function Home() {
  const clothing = useStore((s) => s.clothing)
  const getIdeasByClothing = useStore((s) => s.getIdeasByClothing)
  const favoriteCount = useStore((s) => s.ideas.filter(i => i.favorited).length)
  const [activeGroup, setActiveGroup] = useState<ClothingGroup>('easy')
  const [typeFilter, setTypeFilter] = useState<ClothingType | ''>('')
  const [fabricFilter, setFabricFilter] = useState<FabricType | ''>('')

  const filteredClothing = useMemo(() => {
    return clothing
      .filter(c => c.group === activeGroup)
      .filter(c => !typeFilter || c.type === typeFilter)
      .filter(c => !fabricFilter || c.fabric === fabricFilter)
  }, [clothing, activeGroup, typeFilter, fabricFilter])

  return (
    <div className="min-h-screen bg-cream-100 font-body">
      <section className="relative overflow-hidden bg-gradient-to-br from-terra-50 via-cream-100 to-sage-50 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-sage-800 mb-4"
          >
            让旧衣重获新生
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sage-500 text-lg md:text-xl max-w-lg mx-auto"
          >
            每一件旧衣都藏着新的可能，找到属于它的改造灵感
          </motion.p>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-terra-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sage-200/30 rounded-full blur-3xl" />
      </section>

      <section className="container mx-auto px-6 mt-4">
        <Link
          to="/favorites"
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-cream-300/40 shadow-soft hover:shadow-card hover:border-terra-200 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Heart className={cn('w-4 h-4 transition-colors', favoriteCount > 0 ? 'text-red-400 fill-red-400' : 'text-sage-300')} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-sage-700">收藏灵感</span>
            <span className="text-xs text-sage-400 ml-2">{favoriteCount} 个方案</span>
          </div>
          <span className="text-xs text-terra-500 font-medium">查看全部 →</span>
        </Link>
      </section>

      <section className="container mx-auto px-6 -mt-6">
        <div className="flex justify-center">
          <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-soft border border-cream-300/50">
            {groupTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setActiveGroup(key); setTypeFilter(''); setFabricFilter('') }}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  activeGroup === key
                    ? 'bg-terra-500 text-white shadow-card'
                    : 'text-sage-500 hover:text-sage-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 mt-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-sage-400" />
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as ClothingType | '')}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-cream-300/50 rounded-xl pl-3 pr-8 py-2 text-sm text-sage-700 focus:outline-none focus:ring-2 focus:ring-terra-300 cursor-pointer"
            >
              <option value="">全部类型</option>
              {clothingTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={fabricFilter}
              onChange={e => setFabricFilter(e.target.value as FabricType | '')}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-cream-300/50 rounded-xl pl-3 pr-8 py-2 text-sm text-sage-700 focus:outline-none focus:ring-2 focus:ring-terra-300 cursor-pointer"
            >
              <option value="">全部面料</option>
              {fabricTypes.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400 pointer-events-none" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 mt-8 pb-24">
        {filteredClothing.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClothing.map((item, index) => (
              <ClothingCard key={item.id} item={item} index={index} getIdeasByClothing={getIdeasByClothing} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mb-5">
              {(() => {
                const TabIcon = groupTabs.find(t => t.key === activeGroup)?.icon ?? Sparkles
                return <TabIcon className="w-9 h-9 text-sage-300" />
              })()}
            </div>
            <h3 className="font-display text-xl font-semibold text-sage-600 mb-2">
              {groupEmptyMessages[activeGroup].title}
            </h3>
            <p className="text-sage-400 text-sm max-w-xs text-center">
              {groupEmptyMessages[activeGroup].description}
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terra-500 text-white text-sm font-medium shadow-card hover:bg-terra-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              登记旧衣
            </Link>
          </motion.div>
        )}
      </section>

      <Link
        to="/register"
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full bg-terra-500 text-white shadow-card-hover flex items-center justify-center hover:bg-terra-600 transition-all hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}

function ClothingCard({ item, index, getIdeasByClothing }: {
  item: Clothing
  index: number
  getIdeasByClothing: (id: string) => { difficulty: string; title: string }[]
}) {
  const ideas = getIdeasByClothing(item.id)
  const firstIdea = ideas[0]
  const stars = firstIdea ? difficultyStars[firstIdea.difficulty] ?? 1 : 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/project/${item.id}`}
        className="block bg-white/70 backdrop-blur-sm rounded-2xl border border-cream-300/40 shadow-card hover:shadow-card-hover transition-all overflow-hidden group"
      >
        <div className="relative aspect-[4/3] bg-gradient-to-br from-cream-200 to-terra-50 overflow-hidden">
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.type}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-60">{typeIconMap[item.type]}</span>
            </div>
          )}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium text-sage-700 border border-cream-300/50">
            {item.type}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-sage-400 mb-2">
            <span>{item.fabric}</span>
            <span className="w-1 h-1 rounded-full bg-sage-300" />
            <span>{item.color}</span>
          </div>

          {firstIdea ? (
            <>
              <p className="text-sm font-medium text-sage-700 line-clamp-2 mb-2">
                {firstIdea.title}
              </p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map(s => (
                  <Star
                    key={s}
                    className={cn(
                      'w-3.5 h-3.5',
                      s <= stars
                        ? 'text-terra-400 fill-terra-400'
                        : 'text-cream-400'
                    )}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-sage-400 italic">暂无改造方案</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
