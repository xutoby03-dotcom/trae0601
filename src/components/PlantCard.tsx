import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { Droplets, Sun } from 'lucide-react'
import type { Plant } from '@/types'
import { usePlantStore } from '@/store/plantStore'
import { getActiveAdoption } from '@/store/plantStore'

const EMOJI_MAP: Record<string, string> = {
  发财树: '🌳',
  多肉: '🌵',
  虎皮兰: '🌿',
  绿萝: '🍃',
  白掌: '🌸',
  橡皮树: '🌴',
  仙人掌: '🌵',
  蕨类: '🌿',
  芦荟: '🌱',
  蝴蝶兰: '🦋',
  吊兰: '🌾',
  文竹: '🎋',
}

const STATUS_COLORS: Record<string, string> = {
  healthy: 'bg-green-500',
  thirsty: 'bg-amber-400',
  yellowLeaf: 'bg-orange-500',
  needsNutrients: 'bg-red-500',
}

const LIGHT_ICONS: Record<string, string> = {
  low: '🌙',
  medium: '⛅',
  high: '☀️',
}

function getEmoji(name: string): string {
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (name.includes(key)) return emoji
  }
  return '🪴'
}

interface PlantCardProps {
  plant: Plant
}

export default function PlantCard({ plant }: PlantCardProps) {
  const navigate = useNavigate()
  const adoptions = usePlantStore((s) => s.adoptions)
  const adoption = getActiveAdoption(adoptions, plant.id)
  const daysSinceWater = differenceInDays(new Date(), new Date(plant.lastWateredAt))

  return (
    <div
      onClick={() => navigate(`/plant/${plant.id}`)}
      className="group cursor-pointer rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
        <img
          src={plant.photo}
          alt={plant.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl opacity-0 group-hover:opacity-20 transition-opacity duration-300">
            {getEmoji(plant.name)}
          </span>
        </div>
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_COLORS[plant.status] || 'bg-gray-400'}`}
        >
          {plant.status === 'healthy'
            ? '健康'
            : plant.status === 'thirsty'
              ? '缺水'
              : plant.status === 'yellowLeaf'
                ? '黄叶'
                : '待领养分'}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 truncate">
            {getEmoji(plant.name)} {plant.name}
          </h3>
          <span className="text-xs text-gray-400 shrink-0 ml-1">
            {LIGHT_ICONS[plant.lightNeed] || '☀️'}
            <Sun className="inline w-3 h-3 ml-0.5" />
          </span>
        </div>

        <p className="text-xs text-gray-500">
          📍 {plant.desk} · {plant.area}
        </p>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Droplets className="w-3 h-3 text-blue-400" />
          <span>{daysSinceWater}天前浇水</span>
        </div>

        {adoption ? (
          <p className="text-xs text-emerald-600 font-medium truncate">
            👤 {adoption.userName}
            {adoption.isTemporary && (
              <span className="ml-1 text-amber-500">代养中</span>
            )}
          </p>
        ) : (
          <span className="inline-block text-xs text-red-400 font-medium bg-red-50 px-1.5 py-0.5 rounded">
            无人负责
          </span>
        )}
      </div>
    </div>
  )
}
