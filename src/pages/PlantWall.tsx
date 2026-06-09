import { useState, useMemo } from 'react'
import { Leaf, Droplets, AlertTriangle, FlaskConical, Skull } from 'lucide-react'
import { usePlantStore } from '@/store/plantStore'
import type { PlantStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
import PlantCard from '@/components/PlantCard'

type StatusFilter = 'all' | PlantStatus
type AreaFilter = '全部区域' | 'A区' | 'B区' | 'C区'

const STATUS_TABS: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <Leaf className="w-4 h-4" /> },
  { key: 'healthy', label: '健康', icon: <Leaf className="w-4 h-4" /> },
  { key: 'thirsty', label: '缺水', icon: <Droplets className="w-4 h-4" /> },
  { key: 'yellowLeaf', label: '黄叶', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'needsNutrients', label: '待领养分', icon: <FlaskConical className="w-4 h-4" /> },
]

const AREA_OPTIONS: AreaFilter[] = ['全部区域', 'A区', 'B区', 'C区']

export default function PlantWall() {
  const plants = usePlantStore((s) => s.plants)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [areaFilter, setAreaFilter] = useState<AreaFilter>('全部区域')

  const alivePlants = useMemo(() => plants.filter((p) => !p.isDead), [plants])
  const deadPlants = useMemo(() => plants.filter((p) => p.isDead), [plants])

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: alivePlants.length }
    const statusKeys: PlantStatus[] = ['healthy', 'thirsty', 'yellowLeaf', 'needsNutrients']
    for (const key of statusKeys) {
      counts[key] = alivePlants.filter((p) => p.status === key).length
    }
    return counts
  }, [alivePlants])

  const filteredPlants = useMemo(() => {
    return alivePlants.filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchArea = areaFilter === '全部区域' || p.area === areaFilter
      return matchStatus && matchArea
    })
  }, [alivePlants, statusFilter, areaFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-8 h-8" />
            <h1 className="text-2xl font-bold">绿植墙</h1>
          </div>
          <p className="text-green-100 text-sm">
            共 <span className="font-semibold text-white">{alivePlants.length}</span> 株绿植在岗，
            <span className="font-semibold text-white">{statusCounts.healthy}</span> 株状态良好
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`ml-0.5 text-xs ${
                    statusFilter === tab.key ? 'text-green-200' : 'text-gray-400'
                  }`}
                >
                  {statusCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value as AreaFilter)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {AREA_OPTIONS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Leaf className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">暂无匹配的绿植</p>
            <p className="text-sm mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}

        {deadPlants.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Skull className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-400">已离世的绿植</h2>
              <span className="text-sm text-gray-300">({deadPlants.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {deadPlants.map((plant) => (
                <div
                  key={plant.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden opacity-50 grayscale"
                >
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <Leaf className="w-10 h-10 text-gray-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-400">{plant.name}</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {plant.desk} · {plant.area}
                    </p>
                    <p className="text-xs text-gray-300 mt-2">
                      状态: {STATUS_LABELS[plant.status]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
