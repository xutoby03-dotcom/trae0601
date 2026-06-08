import { Link } from 'react-router-dom'
import type { Plant, Observation } from '@/types'
import { isWaterNeeded, isFertilizeNeeded, hasRecentPest, getDaysSince, VARIETY_PRESETS } from '@/types'
import { Droplets, FlaskConical, Bug, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalconyCellProps {
  row: number
  col: number
  plant: Plant | undefined
  observations: Observation[]
  onWater: (id: string) => void
}

const VARIETY_EMOJI_MAP: Record<string, string> = Object.fromEntries(
  VARIETY_PRESETS.map((v) => [v.name, v.emoji])
)

export default function BalconyCell({ plant, observations, onWater }: BalconyCellProps) {
  if (!plant) {
    return (
      <Link
        to="/add"
        className={cn(
          'h-[140px] sm:h-[160px] rounded-xl border-2 border-dashed border-wood-300/60',
          'flex flex-col items-center justify-center gap-1',
          'bg-wood-50/30 hover:bg-leaf-50/40 hover:border-leaf-300/60',
          'transition-all duration-200 group'
        )}
      >
        <Plus size={20} className="text-wood-300 group-hover:text-leaf-400 transition-colors" />
        <span className="text-[10px] font-serif text-wood-300 group-hover:text-leaf-500 transition-colors">
          空位置
        </span>
      </Link>
    )
  }

  const waterNeeded = isWaterNeeded(plant)
  const fertilizeNeeded = isFertilizeNeeded(plant)
  const pestAlert = hasRecentPest(observations)
  const daysSinceSowing = getDaysSince(plant.sowingDate)
  const emoji = VARIETY_EMOJI_MAP[plant.variety] || '🌱'
  const hasAlert = waterNeeded || fertilizeNeeded || pestAlert

  return (
    <div
      className={cn(
        'h-[140px] sm:h-[160px] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300',
        'card-paper p-0 relative',
        'hover:shadow-xl hover:-translate-y-0.5',
        waterNeeded && 'ring-2 ring-dew-400',
        fertilizeNeeded && !waterNeeded && 'ring-2 ring-chili-400',
        pestAlert && !waterNeeded && 'ring-2 ring-tomato-400 animate-pulse-soft',
      )}
    >
      <Link to={`/plant/${plant.id}`} className="block h-full flex flex-col">
        <div className="relative flex-1 min-h-0">
          <div className="h-full overflow-hidden rounded-t-xl bg-leaf-50">
            {plant.photo ? (
              <img
                src={plant.photo}
                alt={plant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl opacity-50 group-hover:opacity-70 transition-opacity">{emoji}</span>
              </div>
            )}
          </div>

          {hasAlert && (
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5">
              {waterNeeded && (
                <span className="tag-water text-[9px] px-1.5 py-0 leading-4">
                  <Droplets size={8} /> 缺水
                </span>
              )}
              {fertilizeNeeded && (
                <span className="tag-fertilize text-[9px] px-1.5 py-0 leading-4">
                  <FlaskConical size={8} /> 施肥
                </span>
              )}
              {pestAlert && (
                <span className="tag-pest text-[9px] px-1.5 py-0 leading-4">
                  <Bug size={8} /> 虫害
                </span>
              )}
            </div>
          )}

          <div className="absolute bottom-1 left-1">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-white/80 backdrop-blur-sm text-[9px] font-serif text-earth-500">
              第{daysSinceSowing}天
            </span>
          </div>
        </div>

        <div className="px-2 py-1.5 flex items-center gap-1 border-t border-earth-100">
          <span className="text-sm">{emoji}</span>
          <span className="font-handwriting text-sm text-earth-800 truncate leading-tight">
            {plant.name}
          </span>
        </div>
      </Link>

      {waterNeeded && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onWater(plant.id)
          }}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 py-1 bg-dew-100/95 text-dew-700 text-[10px] font-serif font-semibold hover:bg-dew-200 transition-colors opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-200"
        >
          <Droplets size={10} />
          浇水
        </button>
      )}
    </div>
  )
}
