import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, ChevronUp, Recycle, AlertTriangle, Clock } from 'lucide-react'
import { useGarbageStore } from '../stores/useGarbageStore'
import { useRuleStore } from '../stores/useRuleStore'
import ScheduleBanner from '../components/ScheduleBanner'
import GarbageCard from '../components/GarbageCard'
import CorrectModal from '../components/CorrectModal'
import { categoryConfig } from '../utils/category'
import { isCurrentWeek, formatDisposalTime } from '../utils/time'
import { isToday, parseISO } from 'date-fns'
import type { GarbageCategory } from '../types'

export default function Home() {
  const navigate = useNavigate()
  const { records, markDisposed, correctRecord } = useGarbageStore()
  const { rules } = useRuleStore()
  const [correctingId, setCorrectingId] = useState<string | null>(null)
  const [showRecyclable, setShowRecyclable] = useState(false)
  const [showMistakes, setShowMistakes] = useState(false)

  const todayRecords = useMemo(
    () =>
      records
        .filter((r) => !r.disposed && isToday(parseISO(r.disposalTime)))
        .sort((a, b) => a.disposalTime.localeCompare(b.disposalTime)),
    [records]
  )

  const recyclableRecords = useMemo(
    () =>
      records
        .filter((r) => !r.disposed && r.category === 'recyclable')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [records]
  )

  const weekMistakes = useMemo(
    () =>
      records.filter(
        (r) => !r.isCorrect && r.correctedCategory && isCurrentWeek(r.createdAt)
      ),
    [records]
  )

  const mistakeRules = useMemo(
    () => rules.slice(0, 4),
    [rules]
  )

  const recyclableCount = useMemo(
    () =>
      recyclableRecords.reduce((acc, r) => {
        const key = r.name
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    [recyclableRecords]
  )

  const handleCorrect = (correctedCategory: GarbageCategory) => {
    if (correctingId) {
      correctRecord(correctingId, correctedCategory, '1')
      setCorrectingId(null)
    }
  }

  const correctingRecord = useMemo(
    () => records.find((r) => r.id === correctingId),
    [records, correctingId]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-stone-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-stone-800">
            🏠 垃圾分类督促台
          </h1>
          <p className="text-sm text-stone-400 mt-1">别让垃圾混在一起！</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <ScheduleBanner />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-700">今日待扔</h2>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {todayRecords.length}
              </span>
            </div>
          </div>
          {todayRecords.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {todayRecords.map((record) => (
                  <GarbageCard
                    key={record.id}
                    record={record}
                    onMarkDisposed={markDisposed}
                    onCorrect={setCorrectingId}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl border border-stone-200">
              <span className="text-4xl">🎉</span>
              <p className="text-sm text-stone-400 mt-2">今天没有待扔的垃圾</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowRecyclable(!showRecyclable)}
            className="flex items-center gap-2 mb-3"
          >
            <Recycle className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-bold text-stone-700">攒着等回收</h2>
            <span className="text-xs font-semibold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
              {recyclableRecords.length}
            </span>
            {showRecyclable ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>
          <AnimatePresence>
            {showRecyclable && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {Object.keys(recyclableCount).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(recyclableCount).map(([name, count], i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center"
                      >
                        <span className="text-xs font-medium text-sky-700">{name}</span>
                        <div className="mt-1">
                          <span className="text-2xl font-bold text-sky-600">{count}</span>
                          <span className="text-xs text-sky-400 ml-1">件</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-2xl border border-stone-200">
                    <span className="text-3xl">📦</span>
                    <p className="text-sm text-stone-400 mt-2">还没有攒回收物</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowMistakes(!showMistakes)}
            className="flex items-center gap-2 mb-3"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-stone-700">容易分错</h2>
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {weekMistakes.length} 次分错
            </span>
            {showMistakes ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>
          <AnimatePresence>
            {showMistakes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {mistakeRules.map((rule, i) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3"
                    >
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-stone-700">{rule.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-red-400 line-through">{rule.wrongAnswer}</span>
                          <span className="text-xs text-stone-300">→</span>
                          <span className={`text-xs font-medium ${categoryConfig[rule.category].color}`}>
                            {rule.correctAnswer}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/record')}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center text-white transition-colors"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <CorrectModal
        isOpen={!!correctingId}
        onClose={() => setCorrectingId(null)}
        onCorrect={handleCorrect}
        currentCategory={correctingRecord?.category || 'other'}
      />
    </div>
  )
}
