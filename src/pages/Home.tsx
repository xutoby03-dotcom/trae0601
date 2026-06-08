import { Link } from 'react-router-dom'
import { useGardenStore } from '@/store/useGardenStore'
import { isWaterNeeded, isFertilizeNeeded, hasRecentPest } from '@/types'
import PlantCard from '@/components/PlantCard'
import AlertBanner from '@/components/AlertBanner'
import { PlusCircle, Sprout } from 'lucide-react'

export default function Home() {
  const { plants, observations, waterPlant } = useGardenStore()

  const hasPlants = plants.length > 0

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title flex items-center gap-2">
            🏡 我的阳台菜园
          </h2>
          <p className="text-sm font-serif text-earth-500 mt-1">
            {hasPlants
              ? `共 ${plants.length} 盆植物，用心呵护每一株`
              : '开始种植你的第一盆蔬菜吧'}
          </p>
        </div>
        <Link to="/add" className="btn-primary text-sm">
          <PlusCircle size={16} />
          添加植物
        </Link>
      </div>

      {hasPlants && (
        <AlertBanner plants={plants} observations={observations} />
      )}

      {hasPlants ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {plants.map((plant) => {
            const plantObs = observations.filter((o) => o.plantId === plant.id)
            return (
              <PlantCard
                key={plant.id}
                plant={plant}
                observations={plantObs}
                onWater={waterPlant}
              />
            )
          })}
        </div>
      ) : (
        <div className="card-wood p-12 text-center">
          <div className="text-6xl mb-4 animate-float">🌱</div>
          <h3 className="font-handwriting text-2xl text-earth-700 mb-2">
            你的菜园还是空的
          </h3>
          <p className="font-serif text-earth-500 mb-6 max-w-md mx-auto">
            在阳台上种一盆番茄、薄荷或辣椒吧，每天记录它们的成长，
            从播种到收获，这里是你专属的植物观察笔记。
          </p>
          <Link to="/add" className="btn-primary">
            <Sprout size={18} />
            种下第一盆
          </Link>
        </div>
      )}

      {hasPlants && (
        <div className="mt-8 card-paper p-4">
          <h3 className="font-handwriting text-lg text-earth-700 mb-3 flex items-center gap-2">
            📋 快速浇水
          </h3>
          <div className="flex flex-wrap gap-2">
            {plants.filter(isWaterNeeded).length > 0 ? (
              plants.filter(isWaterNeeded).map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => waterPlant(plant.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dew-50 border border-dew-200 text-dew-700 text-sm font-serif hover:bg-dew-100 transition-colors"
                >
                  💧 {plant.name}
                </button>
              ))
            ) : (
              <p className="text-sm font-serif text-leaf-600">✅ 今天都浇过水啦！</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
