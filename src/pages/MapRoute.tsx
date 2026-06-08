import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useTravelStore } from '@/store/useTravelStore'
import RouteMap from '@/components/RouteMap'
import NodePopup from '@/components/NodePopup'
import { createDemoTrip } from '@/utils/helpers'

export default function MapRoute() {
  const {
    trips,
    currentTripId,
    setCurrentTripId,
    addTrip,
    addDay,
    addPhoto,
    getTripDays,
    getTripPhotos,
    getDayPhotos,
  } = useTravelStore()

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [showSelector, setShowSelector] = useState(false)

  const currentTrip = trips.find((t) => t.id === currentTripId)
  const days = currentTripId ? getTripDays(currentTripId) : []
  const photos = currentTripId ? getTripPhotos(currentTripId) : []

  const selectedDay = selectedDayId ? days.find((d) => d.id === selectedDayId) : null
  const selectedDayPhotos = selectedDayId ? getDayPhotos(selectedDayId) : []

  const handleCreateTrip = () => {
    const { trip, days: newDays, photos: newPhotos } = createDemoTrip()
    addTrip(trip)
    newDays.forEach((d) => addDay(d))
    newPhotos.forEach((p) => addPhoto(p))
    setCurrentTripId(trip.id)
    setSelectedDayId(null)
  }

  const handleNodeClick = (dayId: string) => {
    setSelectedDayId(dayId)
  }

  return (
    <div className="min-h-screen bg-warm-cream font-body">
      <header className="sticky top-0 z-30 bg-warm-cream/90 backdrop-blur-sm border-b border-warm-peach/40 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-display text-warm-brown tracking-wide">
          旅途故事地图
        </h1>
        <button
          onClick={handleCreateTrip}
          className="flex items-center gap-1.5 px-4 py-2 bg-warm-orange text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow active:scale-95"
        >
          <Plus className="w-4 h-4" />
          新建旅行
        </button>
      </header>

      {!currentTripId ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-24 h-24 rounded-full bg-warm-peach/40 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-warm-orange/70" />
          </div>
          <p className="text-warm-brown/60 text-lg font-medium">
            开始你的第一段旅途故事
          </p>
          <button
            onClick={handleCreateTrip}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-warm-orange text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            创建旅行
          </button>
        </div>
      ) : (
        <div className="px-4 pt-3">
          <div className="relative mb-4">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-warm-peach/50 shadow-sm"
            >
              {currentTrip?.coverImage && (
                <img
                  src={currentTrip.coverImage}
                  alt={currentTrip.title}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              )}
              <span className="text-sm font-semibold text-warm-brown flex-1 text-left">
                {currentTrip?.title}
              </span>
              <svg
                className={`w-4 h-4 text-warm-brown/50 transition-transform ${showSelector ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-warm-peach/50 shadow-lg z-20 overflow-hidden">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      setCurrentTripId(trip.id)
                      setShowSelector(false)
                      setSelectedDayId(null)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-warm-cream/60 transition-colors ${
                      trip.id === currentTripId ? 'bg-warm-cream' : ''
                    }`}
                  >
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="text-sm text-warm-brown font-medium">{trip.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <RouteMap days={days} photos={photos} onNodeClick={handleNodeClick} />

          {selectedDay && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={() => setSelectedDayId(null)}>
              <div onClick={(e) => e.stopPropagation()}>
                <NodePopup
                  day={selectedDay}
                  photos={selectedDayPhotos}
                  onClose={() => setSelectedDayId(null)}
                  onPhotoClick={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-6 grid grid-cols-2 gap-3">
        <Link
          to="/timeline"
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-warm-peach/40 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium text-warm-brown">时间线</span>
        </Link>
        <Link
          to="/story"
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-warm-peach/40 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📖</span>
          <span className="text-sm font-medium text-warm-brown">故事</span>
        </Link>
      </div>
    </div>
  )
}
