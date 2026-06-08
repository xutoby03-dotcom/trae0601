import { Link } from 'react-router-dom'
import type { Plant, Observation } from '@/types'
import { isWaterNeeded, isFertilizeNeeded, hasRecentPest, getDaysSince, VARIETY_PRESETS } from '@/types'
import { Droplets, FlaskConical, Bug, Flower2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlantCardProps {
  plant: Plant
  observations: Observation[]
  onWater: (id: string) => void
}

const VARIETY_EMOJI_MAP: Record<string, string> = Object.fromEntries(
  VARIETY_PRESETS.map((v) => [v.name, v.emoji])
)

function getVarietyEmoji(variety: string): string {
  return VARIETY_EMOJI_MAP[variety] || '🌱'
}

const ROTATIONS = ['rotate-[-2deg]', 'rotate-[1deg]', 'rotate-[-1deg]', 'rotate-[2deg]', 'rotate-0']

export default function PlantCard({ plant, observations, onWater }: PlantCardProps) {
  const waterNeeded = isWaterNeeded(plant)
  const fertilizeNeeded = isFertilizeNeeded(plant)
  const pestAlert = hasRecentPest(observations)
  const daysSinceSowing = getDaysSince(plant.sowingDate)
  const rotation = ROTATIONS[Math.abs(plant.id.charCodeAt(0)) % ROTATIONS.length]

  return (
    <div
      className={cn(
        'card-paper p-0 group cursor-pointer transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        rotation,
        waterNeeded && 'ring-2 ring-dew-400',
        fertilizeNeeded && 'ring-2 ring-chili-400',
        pestAlert && 'ring-2 ring-tomato-400',
        (waterNeeded && fertilizeNeeded) && 'ring-2 ring-dew-400',
        (waterNeeded && pestAlert) && 'ring-2 ring-tomato-400',
      )}
    >
      <Link to={`/plant/${plant.id}`} className="block">
        <div className="relative">
          <div className="h-36 overflow-hidden rounded-t-2xl bg-leaf-50">
            {plant.photo ? (
              <img
                src={plant.photo}
                alt={plant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl opacity-60">{getVarietyEmoji(plant.variety)}</span>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {waterNeeded && (
              <span className="tag-water shadow-sm">
                <Droplets size={10} /> 缺水
              </span>
            )}
            {fertilizeNeeded && (
              <span className="tag-fertilize shadow-sm">
                <FlaskConical size={10} /> 该施肥
              </span>
            )}
            {pestAlert && (
              <span className="tag-pest shadow-sm">
                <Bug size={10} /> 虫害!
              </span>
            )}
          </div>

          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-[10px] font-serif text-earth-600">
              <Flower2 size={10} />
              第 {daysSinceSowing} 天
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-handwriting text-lg text-earth-800 leading-tight">
                {getVarietyEmoji(plant.variety)} {plant.name}
              </h3>
              <p className="text-[11px] text-earth-500 font-serif mt-0.5">
                {plant.variety} · {plant.potSize === 'small' ? '小盆' : plant.potSize === 'medium' ? '中盆' : '大盆'}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {waterNeeded && (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onWater(plant.id)
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-dew-100 text-dew-700 text-xs font-serif font-semibold hover:bg-dew-200 transition-colors"
          >
            <Droplets size={12} />
            浇水打卡 💧
          </button>
        </div>
      )}
    </div>
  )
}
