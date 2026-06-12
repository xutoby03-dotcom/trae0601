import { Droplets, AlertCircle } from 'lucide-react'
import type { Clothing } from '@/types'
import { CATEGORY_LABELS, COLOR_LABELS, COLOR_HEX, WASH_STATUS_LABELS, SEASON_LABELS } from '@/types'
import { getDaysSince } from '@/store/wardrobeStore'

interface ClothingCardProps {
  item: Clothing
  onEdit: (item: Clothing) => void
  onDelete: (id: string) => void
}

export default function ClothingCard({ item, onEdit, onDelete }: ClothingCardProps) {
  const daysSince = getDaysSince(item.lastWornDate)
  const isIdle = daysSince > 30
  const isDirty = item.washStatus === 'dirty'

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
      onClick={() => onEdit(item)}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: COLOR_HEX[item.color] + '22' }}
          >
            <div
              className="w-20 h-20 rounded-full opacity-30"
              style={{ backgroundColor: COLOR_HEX[item.color] }}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {isDirty && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-medium px-2 py-1 rounded-full">
            <Droplets size={10} />
            {WASH_STATUS_LABELS[item.washStatus]}
          </div>
        )}

        {isIdle && !isDirty && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-medium px-2 py-1 rounded-full">
            <AlertCircle size={10} />
            闲置{daysSince}天
          </div>
        )}

        <div className="absolute top-3 right-3">
          <div
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: COLOR_HEX[item.color] }}
            title={COLOR_LABELS[item.color]}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-display font-semibold text-base leading-tight truncate">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[item.category]}
            </span>
            <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {COLOR_LABELS[item.color]}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div className="flex gap-1">
          {item.seasons.map((s) => (
            <span
              key={s}
              className="text-[10px] px-1.5 py-0.5 rounded bg-warm-100 text-warm-500"
            >
              {SEASON_LABELS[s]}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="text-[10px] text-charcoal/30 hover:text-red-500 transition-colors px-2 py-1"
        >
          删除
        </button>
      </div>
    </div>
  )
}
