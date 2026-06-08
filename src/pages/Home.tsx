import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Inbox } from 'lucide-react'
import MoodWheel from '@/components/MoodWheel'
import TimeSelector from '@/components/TimeSelector'
import RecommendationCard from '@/components/RecommendationCard'
import BlindDrawButton from '@/components/BlindDrawButton'
import { useAppStore } from '@/store/useAppStore'
import type { Mood, TimeSlot } from '@/lib/types'

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const getRecommendations = useAppStore((s) => s.getRecommendations)
  const mediaItems = useAppStore((s) => s.mediaItems)

  const recommendations =
    selectedMood && selectedTime
      ? getRecommendations(selectedMood, selectedTime)
      : []

  const handleConsume = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const showResults = selectedMood && selectedTime

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-serif text-amber-100/90 tracking-wide">
            今天想看点什么？
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            选个心情，挑个时间，我来给你推荐
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MoodWheel selected={selectedMood} onSelect={setSelectedMood} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <p className="text-center text-slate-500 text-xs mb-3">还有多少时间？</p>
          <TimeSelector selected={selectedTime} onSelect={setSelectedTime} />
        </motion.div>

        <AnimatePresence mode="wait">
          {showResults && (
            <motion.div
              key={`${selectedMood}-${selectedTime}-${refreshKey}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-amber-400/60" />
                <h2 className="text-amber-200/80 font-serif text-base">为你推荐</h2>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map(({ item, reason }) => (
                    <RecommendationCard
                      key={item.id}
                      item={item}
                      reason={reason}
                      mood={selectedMood!}
                      onConsume={handleConsume}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Inbox size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">
                    {mediaItems.length === 0
                      ? '清单还是空的，先去添加些书影音吧'
                      : '这个组合暂时没有匹配的内容，试试其他心情？'}
                  </p>
                </div>
              )}

              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-slate-600 text-xs">或者</span>
                  <div className="h-px flex-1 bg-slate-800/60" />
                </div>
                <BlindDrawButton
                  mood={selectedMood!}
                  timeSlot={selectedTime!}
                  onConsume={handleConsume}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
