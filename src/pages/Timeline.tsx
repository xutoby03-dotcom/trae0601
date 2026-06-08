import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Filter, ArrowLeft } from 'lucide-react'
import { useTravelStore } from '@/store/useTravelStore'
import PhotoCard from '@/components/PhotoCard'
import TagBadge from '@/components/TagBadge'
import { ALL_TAGS, TagName, Photo } from '@/types'
import { formatDateFull } from '@/utils/helpers'
import { WEATHER_ICONS } from '@/types'

export default function Timeline() {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<TagName | null>(null)
  const { currentTripId, getTripDays, getDayPhotos, getTripTotalCost } = useTravelStore()

  if (!currentTripId) {
    return (
      <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🗺️</div>
        <p className="text-gray-500 text-lg">请先选择一个旅行</p>
        <Link
          to="/"
          className="mt-2 px-5 py-2 bg-warm-orange text-white rounded-full hover:bg-warm-orange/90 transition"
        >
          返回首页
        </Link>
      </div>
    )
  }

  const days = getTripDays(currentTripId)
  const totalCost = getTripTotalCost(currentTripId)

  const toggleDay = (dayId: string) => {
    setExpandedDayId(prev => (prev === dayId ? null : dayId))
  }

  const filterPhotos = (photos: Photo[]) => {
    if (!selectedTag) return photos
    return photos.filter(p => p.tags.includes(selectedTag))
  }

  return (
    <div className="min-h-screen bg-warm-cream pb-32">
      <div className="sticky top-0 z-10 bg-warm-cream/90 backdrop-blur-sm border-b border-warm-peach/40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/" className="text-warm-brown hover:text-warm-orange transition">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold text-warm-brown font-body">时间线</h1>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          <Filter size={16} className="text-warm-orange shrink-0" />
          <button
            onClick={() => setSelectedTag(null)}
            className={`tag-pill ${selectedTag === null ? 'bg-warm-orange text-white ring-2 ring-warm-orange ring-offset-1' : 'bg-warm-peach/40 text-warm-brown'}`}
          >
            全部
          </button>
          {ALL_TAGS.map(tag => (
            <TagBadge
              key={tag}
              name={tag}
              selected={selectedTag === tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            />
          ))}
        </div>
      </div>

      <div className="relative px-4 pt-4">
        <div className="absolute left-8 top-4 bottom-0 w-0.5 bg-warm-peach/60" />

        {days.map((day, idx) => {
          const isExpanded = expandedDayId === day.id
          const photos = getDayPhotos(day.id)
          const filtered = filterPhotos(photos)
          const dayCost = photos.reduce((s, p) => s + p.cost, 0)

          return (
            <div key={day.id} className="relative mb-4">
              <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-warm-orange border-4 border-warm-cream z-10" />

              <div
                className="ml-10 bg-white rounded-2xl shadow-sm border border-warm-peach/40 overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => toggleDay(day.id)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-warm-orange/10 text-warm-orange text-xs font-semibold px-2 py-0.5 rounded-full">
                        Day {idx + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {WEATHER_ICONS[day.weather]}
                      </span>
                    </div>
                    <div className="font-semibold text-warm-brown truncate">
                      {formatDateFull(day.date)}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      📍 {day.location}
                      {dayCost > 0 && (
                        <span className="ml-2 text-orange-500">¥{dayCost}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-warm-orange ml-2">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-warm-peach/30 pt-3">
                    {filtered.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {filtered.map(photo => (
                          <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onClick={() => {}}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-6 text-sm">
                        没有匹配的照片
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-warm-brown text-white py-3 px-6 flex items-center justify-between z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <span className="font-body text-sm opacity-80">旅行总计</span>
        <span className="text-lg font-bold">总计 ¥{totalCost}</span>
      </div>
    </div>
  )
}
