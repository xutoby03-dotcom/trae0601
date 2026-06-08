import type { Weather } from '@/types'
import { WEATHER_ICONS } from '@/types'
import { formatDate } from '@/utils/helpers'

interface DayItem {
  id: string
  tripId: string
  date: string
  location: string
  weather: Weather
  totalCost: number
}

interface PhotoItem {
  id: string
  dayId: string
  url: string
  location: string
  date: string
  companions: string
  cost: number
  weather: Weather
  story: string
  tags: string[]
}

interface RouteMapProps {
  days: DayItem[]
  photos: PhotoItem[]
  onNodeClick: (dayId: string) => void
}

const NODE_SPACING_Y = 140
const CONTAINER_PADDING_TOP = 60
const HORIZONTAL_CENTER = 220
const HORIZONTAL_OFFSET = 60

function getNodePositions(count: number): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    x: HORIZONTAL_CENTER + (i % 2 === 0 ? -HORIZONTAL_OFFSET : HORIZONTAL_OFFSET),
    y: CONTAINER_PADDING_TOP + i * NODE_SPACING_Y,
  }))
}

export default function RouteMap({ days, onNodeClick }: RouteMapProps) {
  const positions = getNodePositions(days.length)
  const containerHeight = CONTAINER_PADDING_TOP + (days.length - 1) * NODE_SPACING_Y + 120
  const containerWidth = HORIZONTAL_CENTER + HORIZONTAL_OFFSET + 80

  return (
    <div className="relative w-full min-h-[500px] overflow-x-auto overflow-y-auto rounded-2xl"
      style={{ background: '#FFF8F0' }}
    >
      <div
        className="relative"
        style={{
          width: containerWidth,
          minHeight: containerHeight,
          backgroundImage: `radial-gradient(circle, #e8ddd0 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={containerWidth}
          height={containerHeight}
          style={{ zIndex: 0 }}
        >
          {positions.slice(0, -1).map((pos, i) => {
            const next = positions[i + 1]
            return (
              <line
                key={`line-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={next.x}
                y2={next.y}
                stroke="#E8853D"
                strokeWidth={2.5}
                strokeDasharray="8 6"
                strokeLinecap="round"
                opacity={0.7}
              />
            )
          })}
        </svg>

        {days.map((day, i) => {
          const pos = positions[i]
          return (
            <div
              key={day.id}
              className="absolute flex flex-col items-center cursor-pointer"
              style={{
                left: pos.x - 40,
                top: pos.y - 28,
                zIndex: 1,
              }}
              onClick={() => onNodeClick(day.id)}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg">{WEATHER_ICONS[day.weather]}</span>
              </div>
              <div
                className="
                  w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center
                  border-[3px] border-orange-400/70 shadow-md
                  transition-all duration-300 ease-in-out
                  hover:scale-110 hover:shadow-lg hover:border-orange-500
                  active:animate-pulse active:scale-95
                "
                style={{ background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)' }}
              >
                <span className="text-sm font-bold text-orange-800 leading-tight">
                  {formatDate(day.date)}
                </span>
              </div>
              <span className="mt-1.5 text-sm font-semibold text-orange-900/80 whitespace-nowrap">
                {day.location}
              </span>
            </div>
          )
        })}

        <div
          className="absolute top-3 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(232, 133, 61, 0.12)', zIndex: 2 }}
        >
          <span className="text-base">🗺️</span>
          <span className="text-sm font-semibold text-orange-800/80">路线图</span>
        </div>
      </div>
    </div>
  )
}
