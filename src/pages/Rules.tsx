import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, Filter } from 'lucide-react'
import { useRuleStore } from '../stores/useRuleStore'
import RuleFlipCard from '../components/RuleFlipCard'
import type { GarbageCategory } from '../types'
import { categoryConfig, categoryList } from '../utils/category'

export default function Rules() {
  const { rules, toggleFavorite } = useRuleStore()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<GarbageCategory | 'all'>('all')
  const [showFavOnly, setShowFavOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = rules

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.correctAnswer.toLowerCase().includes(q) ||
          r.wrongAnswer.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      )
    }

    if (filterCat !== 'all') {
      result = result.filter((r) => r.category === filterCat)
    }

    if (showFavOnly) {
      result = result.filter((r) => r.isFavorited)
    }

    return result
  }, [rules, search, filterCat, showFavOnly])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-stone-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-stone-800">📖 分类规则卡</h1>
          <p className="text-sm text-stone-400 mt-1">点击卡片翻转看正确分类</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索垃圾名称..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-stone-800 placeholder-stone-300 transition-colors"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide"
        >
          <button
            onClick={() => setFilterCat('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCat === 'all'
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
            }`}
          >
            全部
          </button>
          {categoryList.map((cat) => {
            const config = categoryConfig[cat]
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterCat === cat
                    ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                    : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                {config.emoji} {config.label}
              </button>
            )
          })}
          <button
            onClick={() => setShowFavOnly(!showFavOnly)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              showFavOnly
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
            }`}
          >
            <Star className={`w-3 h-3 ${showFavOnly ? 'fill-amber-400' : ''}`} />
            收藏
          </button>
        </motion.div>

        <div className="space-y-4">
          {filtered.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RuleFlipCard rule={rule} onToggleFavorite={toggleFavorite} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl">🔍</span>
              <p className="text-sm text-stone-400 mt-3">没有找到匹配的规则</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
