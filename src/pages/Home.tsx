import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PenLine, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EnvelopeCard from '@/components/EnvelopeCard'
import TemplateCards from '@/components/TemplateCards'
import { useCapsuleStore } from '@/store/capsuleStore'
import { MOOD_COLORS, THEME_COLORS } from '@/lib/utils'
import type { CapsuleFilter } from '@/types'

const filters: { key: CapsuleFilter; label: string; emoji?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'ready-to-open', label: '可拆信', emoji: '✨' },
  { key: 'on-the-way', label: '在路上' },
  { key: 'opened', label: '已拆信' },
]

export default function Home() {
  const { capsules, filter, moodFilter, templates, setFilter, setMoodFilter, loadCapsules, loadTemplates } = useCapsuleStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCapsules()
    loadTemplates()
  }, [loadCapsules, loadTemplates])

  const filteredCapsules = useMemo(() => {
    let result = capsules

    if (filter === 'on-the-way') result = result.filter((c) => c.isLocked)
    if (filter === 'ready-to-open') result = result.filter((c) => !c.isLocked && !c.isOpened)
    if (filter === 'opened') result = result.filter((c) => c.isOpened)

    if (moodFilter) result = result.filter((c) => c.moodColor === moodFilter)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.isOpened && c.content.toLowerCase().includes(q))
      )
    }

    if (filter === 'all') {
      result = [...result].sort((a, b) => {
        const aReady = !a.isLocked && !a.isOpened ? 0 : 1
        const bReady = !b.isLocked && !b.isOpened ? 0 : 1
        if (aReady !== bReady) return aReady - bReady
        if (aReady === 0 && bReady === 0) {
          return new Date(a.openDate).getTime() - new Date(b.openDate).getTime()
        }
        return 0
      })
    }

    if (filter === 'ready-to-open') {
      result = [...result].sort((a, b) => new Date(a.openDate).getTime() - new Date(b.openDate).getTime())
    }

    return result
  }, [capsules, filter, moodFilter, searchQuery])

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(180deg, ${THEME_COLORS.darkBrown} 0%, #1A0F08 100%)` }}>
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1
            className="mb-1 text-3xl font-bold tracking-tight"
            style={{ color: THEME_COLORS.gold, fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            时间胶囊
          </h1>
          <p className="text-sm text-[#8B7355]">
            写给未来的信，跨越时光与自己对话
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7355]/50" />
            <input
              type="text"
              placeholder="搜索胶囊..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#4A3228]/30 bg-[#2C1810]/60 py-2.5 pl-9 pr-4 text-xs text-[#E8C99B] placeholder-[#8B7355]/40 outline-none transition-colors focus:border-[#D4A574]/50"
            />
          </div>

          <div className="mb-3 flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  filter === f.key
                    ? 'text-[#2C1810] shadow-md'
                    : 'border border-[#4A3228]/40 text-[#8B7355] hover:border-[#D4A574]/40'
                }`}
                style={{
                  background: filter === f.key ? THEME_COLORS.gold : 'transparent',
                }}
              >
                {f.emoji && <span className="mr-0.5">{f.emoji}</span>}
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8B7355]/50">心情：</span>
            <button
              onClick={() => setMoodFilter(null)}
              className={`h-4 w-4 rounded-full border transition-all ${
                !moodFilter ? 'border-white ring-1 ring-white/30' : 'border-[#8B7355]/30 bg-[#4A3228]/30 hover:border-[#8B7355]/60'
              }`}
            >
              <span className="flex h-full w-full items-center justify-center text-[6px] text-[#8B7355]">×</span>
            </button>
            {MOOD_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setMoodFilter(moodFilter === c.value ? null : c.value)}
                className={`h-4 w-4 rounded-full transition-all ${
                  moodFilter === c.value ? 'ring-2 ring-offset-1 ring-offset-[#2C1810] scale-125' : 'hover:scale-110'
                }`}
                style={{ background: c.value, boxShadow: moodFilter === c.value ? `0 0 0 1px #2C1810, 0 0 0 3px ${c.value}` : undefined }}
              />
            ))}
          </div>
        </motion.div>

        {capsules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <TemplateCards templates={templates} />
          </motion.div>
        )}

        {filteredCapsules.length === 0 && capsules.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="text-sm text-[#8B7355]/50">没有找到匹配的胶囊</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCapsules.map((capsule, i) => (
            <EnvelopeCard key={capsule.id} capsule={capsule} index={i} />
          ))}
        </div>

        {capsules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-col items-center py-8 text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `${THEME_COLORS.gold}10` }}>
              <span className="text-3xl">💌</span>
            </div>
            <p className="mb-2 text-sm text-[#8B7355]">还没有时间胶囊</p>
            <p className="mb-6 text-xs text-[#8B7355]/50">写一封信给未来的自己吧</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${THEME_COLORS.gold}, ${THEME_COLORS.lightGold})`,
                color: THEME_COLORS.darkBrown,
              }}
            >
              <PenLine size={16} />
              写第一封信
            </motion.button>
          </motion.div>
        )}

        {capsules.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 mt-8"
          >
            <p className="mb-3 text-xs text-[#8B7355]/50">快速创建</p>
            <TemplateCards templates={templates} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
