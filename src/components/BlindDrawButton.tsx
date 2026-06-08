import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, X, MessageSquare } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { MEDIA_TYPE_CONFIG, MOOD_CONFIG, type Mood, type TimeSlot, type MediaItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  mood: Mood
  timeSlot: TimeSlot
  onConsume: () => void
}

export default function BlindDrawButton({ mood, timeSlot, onConsume }: Props) {
  const blindDraw = useAppStore((s) => s.blindDraw)
  const recordBlindDraw = useAppStore((s) => s.recordBlindDraw)
  const consumeItem = useAppStore((s) => s.consumeItem)

  const [drawnItem, setDrawnItem] = useState<MediaItem | null>(null)
  const [showSwapInput, setShowSwapInput] = useState(false)
  const [swapReason, setSwapReason] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)

  const handleDraw = () => {
    setIsSpinning(true)
    setDrawnItem(null)
    setShowSwapInput(false)

    setTimeout(() => {
      const item = blindDraw(mood, timeSlot)
      setDrawnItem(item)
      setIsSpinning(false)

      if (item) {
        recordBlindDraw({
          mediaId: item.id,
          mood,
          timeSlot,
          accepted: true,
        })
      }
    }, 800)
  }

  const handleSwap = () => {
    if (drawnItem && swapReason.trim()) {
      recordBlindDraw({
        mediaId: drawnItem.id,
        mood,
        timeSlot,
        accepted: false,
        swapReason: swapReason.trim(),
      })
    }
    setSwapReason('')
    setShowSwapInput(false)
    handleDraw()
  }

  const handleAccept = () => {
    if (drawnItem) {
      consumeItem(drawnItem.id, mood)
      setDrawnItem(null)
      onConsume()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDraw}
        disabled={isSpinning}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer',
          'bg-gradient-to-br from-amber-600/30 to-amber-800/30',
          'border-2 border-amber-500/40',
          'shadow-lg shadow-amber-900/20',
          'hover:shadow-amber-800/30 hover:border-amber-400/60',
          'transition-all duration-300',
          isSpinning && 'animate-spin'
        )}
      >
        <Shuffle
          size={28}
          className={cn(
            'text-amber-300 transition-transform',
            isSpinning && 'animate-pulse'
          )}
        />
      </motion.button>
      <span className="text-slate-500 text-xs">碰碰运气</span>

      <AnimatePresence>
        {drawnItem && (
          <motion.div
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            className="w-full bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/40 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{MEDIA_TYPE_CONFIG[drawnItem.type].icon}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${MEDIA_TYPE_CONFIG[drawnItem.type].color}20`,
                  color: MEDIA_TYPE_CONFIG[drawnItem.type].color,
                }}
              >
                {MEDIA_TYPE_CONFIG[drawnItem.type].label}
              </span>
              <span className="text-slate-500 text-xs">{drawnItem.duration}分钟</span>
            </div>

            <h4 className="text-white font-serif text-lg">{drawnItem.title}</h4>

            <p className="mt-1 text-amber-300/60 text-xs italic font-serif">
              在{MOOD_CONFIG[mood].emoji}{MOOD_CONFIG[mood].label}的时候，也许需要这个
            </p>

            {drawnItem.note && (
              <p className="mt-1 text-slate-500 text-[11px]">{drawnItem.note}</p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/30 transition-colors cursor-pointer"
              >
                就它了 ✨
              </button>
              <button
                onClick={() => setShowSwapInput(true)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-slate-700/40 text-slate-400 hover:bg-slate-700/60 border border-slate-600/30 transition-colors cursor-pointer"
              >
                换一个
              </button>
            </div>

            {showSwapInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3"
              >
                <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs">
                  <MessageSquare size={12} />
                  <span>为什么不想看这个？</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSwap()}
                    placeholder="比如：看过了、没心情看这个类型..."
                    className="flex-1 bg-slate-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    autoFocus
                  />
                  <button
                    onClick={handleSwap}
                    className="px-3 py-1.5 rounded-lg text-sm bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/30 cursor-pointer"
                  >
                    换
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
