import { motion } from 'framer-motion'
import { Star, Clock, Check } from 'lucide-react'
import { MEDIA_TYPE_CONFIG, type MediaItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { Mood } from '@/lib/types'

interface Props {
  item: MediaItem
  reason: string
  mood: Mood
  onConsume: () => void
}

export default function RecommendationCard({ item, reason, mood, onConsume }: Props) {
  const consumeItem = useAppStore((s) => s.consumeItem)
  const typeConfig = MEDIA_TYPE_CONFIG[item.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/40 overflow-hidden hover:border-slate-600/60 transition-colors"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: typeConfig.color }}
      />

      <div className="pl-4 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{typeConfig.icon}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${typeConfig.color}20`,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.label}
              </span>
              {item.consumed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                  已看
                </span>
              )}
            </div>
            <h3 className="text-white font-serif text-base truncate">{item.title}</h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                className={s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {item.duration} 分钟
          </span>
          <span>强度 {item.intensity}/5</span>
        </div>

        <p className="mt-3 text-amber-300/70 text-xs italic font-serif leading-relaxed">
          💬 {reason}
        </p>

        {item.note && (
          <p className="mt-1.5 text-slate-500 text-[11px] truncate">
            {item.note}
          </p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              consumeItem(item.id, mood)
              onConsume()
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/30'
            )}
          >
            <Check size={12} />
            就看这个
          </button>
        </div>
      </div>
    </motion.div>
  )
}
