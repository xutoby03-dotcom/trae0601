import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { Heart, HandHeart } from 'lucide-react'
import { usePlantStore } from '@/store/plantStore'
import { CURRENT_USER } from '@/data/mockData'
import { DAY_LABELS } from '@/types'
import PlantCard from '@/components/PlantCard'

type Tab = 'mine' | 'orphan'

export default function MyPlants() {
  const navigate = useNavigate()
  const plants = usePlantStore((s) => s.plants)
  const adoptions = usePlantStore((s) => s.adoptions)

  const [tab, setTab] = useState<Tab>('mine')

  const myAdoptionPlantIds = adoptions
    .filter((a) => a.userId === CURRENT_USER.id && !a.endDate)
    .map((a) => a.plantId)
  const myPlants = plants.filter((p) => myAdoptionPlantIds.includes(p.id))
  const adoptedPlantIds = new Set(adoptions.filter((a) => !a.endDate).map((a) => a.plantId))
  const orphanPlants = plants.filter((p) => !adoptedPlantIds.has(p.id) && !p.isDead)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">我的绿植</h1>
          </div>
          <p className="text-emerald-100">管理你负责的绿植，或领养一盆新伙伴</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === 'mine'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🌱 我负责的 ({myPlants.length})
          </button>
          <button
            onClick={() => setTab('orphan')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === 'orphan'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏠 待领养 ({orphanPlants.length})
          </button>
        </div>

        {tab === 'mine' && (
          myPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Heart className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">还没有负责的绿植</p>
              <p className="text-sm mt-1">去"待领养"挑选一盆吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {myPlants.map((plant) => {
                const adoption = adoptions.find((a) => a.plantId === plant.id && !a.endDate)
                const daysSinceWater = differenceInDays(new Date(), new Date(plant.lastWateredAt))
                return (
                  <div key={plant.id} className="space-y-1">
                    <PlantCard plant={plant} />
                    {adoption && (
                      <div className="bg-white rounded-xl p-3 shadow-sm space-y-1 text-xs">
                        <p className="text-emerald-600 font-medium">
                          💧 浇水日：{adoption.wateringDays.map((d: number) => `周${DAY_LABELS[d]}`).join('、')}
                        </p>
                        <p className="text-gray-500">
                          已 {daysSinceWater} 天未浇水
                          {daysSinceWater > plant.wateringFrequencyDays && (
                            <span className="text-red-400 ml-1">⚠️ 需要浇水了</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}

        {tab === 'orphan' && (
          orphanPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <HandHeart className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">暂无待领养的绿植</p>
              <p className="text-sm mt-1">所有绿植都有人照顾啦 🎉</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orphanPlants.map((plant) => (
                <div key={plant.id}>
                  <PlantCard plant={plant} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/plant/${plant.id}`)
                    }}
                    className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    🤝 领养这盆绿植
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
