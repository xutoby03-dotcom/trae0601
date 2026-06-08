import { useDraggable } from '@dnd-kit/core'
import type { Place } from '@/types'

const categoryColors: Record<string, string> = {
  coffee: 'bg-amber-50 border-amber-200 hover:border-amber-400',
  park: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
  bookstore: 'bg-violet-50 border-violet-200 hover:border-violet-400',
  exhibition: 'bg-rose-50 border-rose-200 hover:border-rose-400',
  riverside: 'bg-sky-50 border-sky-200 hover:border-sky-400',
  nightmarket: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  bakery: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
  gallery: 'bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-400',
}

export default function PlaceCard({ place, inPool = true }: { place: Place; inPool?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: inPool ? `pool-${place.id}` : `route-${place.id}`,
    data: { place, fromPool: inPool },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative rounded-2xl border-2 p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 select-none
        ${categoryColors[place.category] || 'bg-gray-50 border-gray-200'}
        ${isDragging ? 'opacity-50 scale-105 shadow-lg z-50' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-2xl flex-shrink-0 mt-0.5">{place.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-[#3D2C2E] truncate">{place.name}</div>
          <div className="flex flex-wrap gap-1.5 mt-1 text-xs text-[#6B5356]">
            <span className="bg-white/70 px-1.5 py-0.5 rounded-full">
              ⏱ {place.stayMinutes}min
            </span>
            <span className="bg-white/70 px-1.5 py-0.5 rounded-full">
              🚶 {place.walkDistance}km
            </span>
            <span className="bg-white/70 px-1.5 py-0.5 rounded-full">
              💰 ¥{place.budget}
            </span>
          </div>
          <div className="text-xs text-[#8B7073] mt-1">
            🕐 {place.openTime} - {place.closeTime}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/50 text-[#8B7073]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
