import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Star } from 'lucide-react'
import { MOOD_CONFIG, MEDIA_TYPE_CONFIG, type MediaItem, type Mood, type MediaType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  item?: MediaItem
  onSubmit: (data: Omit<MediaItem, 'id' | 'createdAt'>) => void
  onClose: () => void
}

const MOODS: Mood[] = ['tired', 'annoyed', 'happy', 'insomnia', 'want-cry', 'want-learn', 'want-empty']
const TYPES: MediaType[] = ['book', 'movie', 'series', 'music']

export default function MediaForm({ item, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [type, setType] = useState<MediaType>(item?.type ?? 'movie')
  const [duration, setDuration] = useState(item?.duration ?? 60)
  const [moods, setMoods] = useState<Mood[]>(item?.moods ?? [])
  const [intensity, setIntensity] = useState(item?.intensity ?? 3)
  const [consumed, setConsumed] = useState(item?.consumed ?? false)
  const [rating, setRating] = useState(item?.rating ?? 3)
  const [note, setNote] = useState(item?.note ?? '')

  const toggleMood = (mood: Mood) => {
    setMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      type,
      duration,
      moods,
      intensity,
      consumed,
      rating,
      note: note.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-white font-serif text-lg">
            {item ? '编辑条目' : '添加新条目'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="书名、电影名..."
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1.5">类型</label>
            <div className="flex gap-2">
              {TYPES.map((t) => {
                const config = MEDIA_TYPE_CONFIG[t]
                const isSelected = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border',
                      isSelected
                        ? 'border-amber-500/40 text-amber-300'
                        : 'border-slate-700/50 text-slate-500 hover:border-slate-600/50'
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? `${config.color}15`
                        : 'transparent',
                    }}
                  >
                    {config.icon} {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1.5">时长（分钟）</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1.5">适合心情（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => {
                const config = MOOD_CONFIG[mood]
                const isSelected = moods.includes(mood)
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border',
                      isSelected
                        ? 'border-amber-500/40 text-amber-300'
                        : 'border-slate-700/50 text-slate-500 hover:border-slate-600/50'
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? `${config.color}15`
                        : 'transparent',
                    }}
                  >
                    {config.emoji} {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1.5">强度 {intensity}/5</label>
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-xs">是否已看</label>
            <button
              type="button"
              onClick={() => setConsumed(!consumed)}
              className={cn(
                'w-10 h-5 rounded-full transition-all cursor-pointer relative',
                consumed ? 'bg-amber-600/40' : 'bg-slate-700/50'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full transition-all',
                  consumed ? 'left-5 bg-amber-400' : 'left-0.5 bg-slate-500'
                )}
              />
            </button>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1.5">评分</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="cursor-pointer"
                >
                  <Star
                    size={20}
                    className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1.5">私人备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="一句话说说你的感受..."
              rows={2}
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/30 transition-colors cursor-pointer"
          >
            {item ? '保存修改' : '添加到清单'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
