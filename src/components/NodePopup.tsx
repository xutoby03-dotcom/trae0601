import type { Day, Photo } from '@/types'
import { TAG_CONFIG, WEATHER_ICONS } from '@/types'
import { formatDate } from '@/utils/helpers'
import { X } from 'lucide-react'

interface NodePopupProps {
  day: Day
  photos: Photo[]
  onClose: () => void
  onPhotoClick: (photoId: string) => void
}

export default function NodePopup({ day, photos, onClose, onPhotoClick }: NodePopupProps) {
  return (
    <div className="animate-fade-in-up bg-white rounded-2xl shadow-lg border border-warm-peach/50 w-80 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-warm-brown">
            {formatDate(day.date)}
          </span>
          <span className="text-sm text-warm-brown/60">·</span>
          <span className="text-sm font-medium text-warm-brown">
            {day.location}
          </span>
          <span className="text-base">{WEATHER_ICONS[day.weather]}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-warm-cream transition-colors"
        >
          <X className="w-4 h-4 text-warm-brown/60" />
        </button>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 px-3 pb-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onPhotoClick(photo.id)}
              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-[4/3]"
            >
              <img
                src={photo.url}
                alt={photo.location}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-end p-2">
                <p className="text-white text-xs leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-3">
                  {photo.story}
                </p>
              </div>
              {photo.tags.length > 0 && (
                <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-pill text-[10px] py-0 px-1.5"
                      style={{
                        color: TAG_CONFIG[tag].color,
                        backgroundColor: TAG_CONFIG[tag].bg,
                      }}
                    >
                      {TAG_CONFIG[tag].emoji} {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-warm-peach/30 bg-warm-cream/40">
        <span className="text-sm text-warm-brown/80">
          当日花费 ¥{photos.reduce((s, p) => s + p.cost, 0).toFixed(0)}
        </span>
      </div>
    </div>
  )
}
