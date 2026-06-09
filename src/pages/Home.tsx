import { useState, useMemo } from 'react'
import { Moon, Sun, Zap, Search, SlidersHorizontal } from 'lucide-react'
import SafetyBanner from '@/components/SafetyBanner'
import SpotCard from '@/components/SpotCard'
import { useParkingStore, VEHICLE_SIZE_LABELS } from '@/store/useParkingStore'
import type { VehicleSize } from '@/types'

export default function Home() {
  const { getTonightAvailable, getWeekendAvailable, getStartingSoon, spots } = useParkingStore()
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedSize, setSelectedSize] = useState<VehicleSize | ''>('')
  const [wallOnly, setWallOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const buildings = useMemo(() => [...new Set(spots.map((s) => s.building))], [spots])

  const tonightSpots = useMemo(() => {
    let result = getTonightAvailable()
    if (selectedBuilding) result = result.filter((s) => s.building === selectedBuilding)
    if (selectedSize) result = result.filter((s) => s.vehicleSize === selectedSize || s.vehicleSize === 'any')
    if (wallOnly) result = result.filter((s) => s.isWallAdjacent)
    return result
  }, [getTonightAvailable, selectedBuilding, selectedSize, wallOnly])

  const weekendSpots = useMemo(() => {
    let result = getWeekendAvailable()
    if (selectedBuilding) result = result.filter((s) => s.building === selectedBuilding)
    if (selectedSize) result = result.filter((s) => s.vehicleSize === selectedSize || s.vehicleSize === 'any')
    if (wallOnly) result = result.filter((s) => s.isWallAdjacent)
    return result
  }, [getWeekendAvailable, selectedBuilding, selectedSize, wallOnly])

  const startingSpots = useMemo(() => {
    let result = getStartingSoon()
    if (selectedBuilding) result = result.filter((s) => s.building === selectedBuilding)
    if (selectedSize) result = result.filter((s) => s.vehicleSize === selectedSize || s.vehicleSize === 'any')
    if (wallOnly) result = result.filter((s) => s.isWallAdjacent)
    return result
  }, [getStartingSoon, selectedBuilding, selectedSize, wallOnly])

  return (
    <div className="min-h-screen pb-24">
      <SafetyBanner />

      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-slate-800">车位临停</h1>
        <p className="text-sm text-slate-400 mt-1">邻里互助，共享闲置车位</p>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-100 shadow-sm">
            <Search className="w-4 h-4 text-slate-300" />
            <span className="text-sm text-slate-300">搜索楼栋或车位号</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors ${
              showFilters ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-gray-100 text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">楼栋</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBuilding('')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    selectedBuilding === '' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  全部
                </button>
                {buildings.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBuilding(b)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      selectedBuilding === b ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">车型</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSize('')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    selectedSize === '' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  不限
                </button>
                {(Object.entries(VEHICLE_SIZE_LABELS) as [VehicleSize, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSize(key)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      selectedSize === key ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">仅靠墙位</span>
                <button
                  onClick={() => setWallOnly(!wallOnly)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${wallOnly ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${wallOnly ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 space-y-6">
        {startingSpots.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">快开始</h2>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">30分钟内</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {startingSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
              <Moon className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">今晚可用</h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{tonightSpots.length}个车位</span>
          </div>
          {tonightSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tonightSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-sm text-slate-400">今晚暂无可用车位</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
              <Sun className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">周末可用</h2>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{weekendSpots.length}个车位</span>
          </div>
          {weekendSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weekendSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-sm text-slate-400">周末暂无可用车位</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
