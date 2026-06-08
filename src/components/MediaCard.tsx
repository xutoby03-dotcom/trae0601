import { Star, Clock, Edit3, Trash2 } from 'lucide-react'
import { MEDIA_TYPE_CONFIG, MOOD_CONFIG, type MediaItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  item: MediaItem
  onEdit: (item: MediaItem) => void
  onDelete: (id: string) => void
}

export default function MediaCard({ item, onEdit, onDelete }: Props) {
  const typeConfig = MEDIA_TYPE_CONFIG[item.type]

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30 overflow-hidden hover:border-slate-600/50 transition-colors group">
      <div
        className="h-1"
        style={{ backgroundColor: typeConfig.color }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
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
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400/80 font-medium">
                  已看
                </span>
              )}
            </div>
            <h3 className="text-white font-serif text-sm truncate">{item.title}</h3>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {item.duration}分钟
          </span>
          <span>强度 {item.intensity}/5</span>
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={8}
                className={s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
              />
            ))}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {item.moods.map((mood) => (
            <span
              key={mood}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/40 text-slate-400"
            >
              {MOOD_CONFIG[mood].emoji} {MOOD_CONFIG[mood].label}
            </span>
          ))}
        </div>

        {item.note && (
          <p className="mt-2 text-slate-600 text-[11px] truncate italic">
            {item.note}
          </p>
        )}
      </div>
    </div>
  )
}
