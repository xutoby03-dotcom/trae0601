import type { Plant, Observation } from '@/types'
import { isWaterNeeded, isFertilizeNeeded, hasRecentPest } from '@/types'
import { Droplets, FlaskConical, Bug, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AlertBannerProps {
  plants: Plant[]
  observations: Observation[]
}

export default function AlertBanner({ plants, observations }: AlertBannerProps) {
  const waterNeededPlants = plants.filter((p) => isWaterNeeded(p))
  const fertilizeNeededPlants = plants.filter((p) => isFertilizeNeeded(p))
  const pestAlertPlants = plants.filter((p) => {
    const plantObs = observations.filter((o) => o.plantId === p.id)
    return hasRecentPest(plantObs)
  })

  const totalAlerts = waterNeededPlants.length + fertilizeNeededPlants.length + pestAlertPlants.length

  if (totalAlerts === 0) return null

  return (
    <div className="card-wood p-4 mb-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-chili-500" />
        <h2 className="font-handwriting text-lg text-earth-800">今日提醒</h2>
        <span className="ml-auto text-xs font-serif text-earth-500">{totalAlerts} 项待处理</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {waterNeededPlants.length > 0 && (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dew-50 border border-dew-200 text-dew-700 text-sm font-serif hover:bg-dew-100 transition-colors"
          >
            <Droplets size={14} />
            <span className="font-mono font-semibold">{waterNeededPlants.length}</span>
            盆需要浇水
          </Link>
        )}

        {fertilizeNeededPlants.length > 0 && (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-chili-50 border border-chili-200 text-chili-700 text-sm font-serif hover:bg-chili-100 transition-colors"
          >
            <FlaskConical size={14} />
            <span className="font-mono font-semibold">{fertilizeNeededPlants.length}</span>
            盆该施肥了
          </Link>
        )}

        {pestAlertPlants.length > 0 && (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-tomato-50 border border-tomato-200 text-tomato-700 text-sm font-serif hover:bg-tomato-100 transition-colors animate-pulse-soft"
          >
            <Bug size={14} />
            <span className="font-mono font-semibold">{pestAlertPlants.length}</span>
            盆可能有虫害
          </Link>
        )}
      </div>
    </div>
  )
}
