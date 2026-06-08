import { useState } from 'react'
import PlaceCard from './PlaceCard'
import { useWalkStore } from '@/store/useWalkStore'

const categoryLabels: Record<string, string> = {
  all: '全部',
  coffee: '☕ 咖啡',
  park: '🌳 公园',
  bookstore: '📖 书店',
  exhibition: '🎨 展览',
  riverside: '🌊 河边',
  nightmarket: '🎪 夜市',
  bakery: '🥐 烘焙',
  gallery: '🖼️ 画廊',
}

export default function PlacePool() {
  const places = useWalkStore((s) => s.places)
  const routePlaces = useWalkStore((s) => s.routePlaces)
  const addToRoute = useWalkStore((s) => s.addToRoute)
  const setSelectedPlace = useWalkStore((s) => s.setSelectedPlace)
  const [filter, setFilter] = useState<string>('all')

  const routeIds = new Set(routePlaces.map((p) => p.id))
  const filtered = filter === 'all' ? places : places.filter((p) => p.category === filter)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-[#3D2C2E] mb-2">📍 地点卡池</h2>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all duration-200
                ${
                  filter === key
                    ? 'bg-[#F97316] text-white shadow-md scale-105'
                    : 'bg-white/60 text-[#6B5356] hover:bg-white/90'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 mt-2">
        {filtered.map((place) => {
          const inRoute = routeIds.has(place.id)
          return (
            <div
              key={place.id}
              className="relative"
              onClick={() => setSelectedPlace(place.id)}
            >
              <PlaceCard place={place} inPool />
              {inRoute && (
                <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-xs font-bold text-[#F97316] bg-white px-3 py-1 rounded-full shadow">
                    已添加 ✓
                  </span>
                </div>
              )}
              {!inRoute && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addToRoute(place.id)
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#F97316] text-white
                    flex items-center justify-center text-lg font-light
                    hover:scale-110 active:scale-95 transition-transform shadow-md"
                >
                  +
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
