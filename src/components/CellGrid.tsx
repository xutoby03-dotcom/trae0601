import { useState } from 'react'
import { X, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInsectHotel } from '../hooks/useInsectHotel'
import { MATERIAL_NAMES, HEIGHT_NAMES, ORIENTATION_NAMES, STATUS_NAMES } from '../types'
import { formatDateDisplay } from '../utils/dateUtils'

const statusColors: Record<string, string> = {
  occupied: 'bg-green-500 hover:bg-green-600 border-green-600',
  underObservation: 'bg-amber-400 hover:bg-amber-500 border-amber-500',
  empty: 'bg-stone-300 hover:bg-stone-400 border-stone-400',
}

const statusLabels: Record<string, string> = {
  occupied: '已入住',
  underObservation: '观察中',
  empty: '空置',
}

export function CellGrid() {
  const { cells, selectedCellId, selectCell, isLoading } = useInsectHotel()
  const navigate = useNavigate()
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const selectedCell = cells.find((c) => c.id === selectedCellId)

  const handleRecordObservation = (cellId: string) => {
    selectCell(cellId)
    navigate('/record')
  }

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-stone-800">🐛 昆虫旅馆小格地图</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-500" />
            <span className="text-stone-600">已入住</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-400" />
            <span className="text-stone-600">观察中</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-stone-300" />
            <span className="text-stone-600">空置</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="relative group"
              onMouseEnter={() => setHoveredCell(cell.id)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{ animation: `fadeInUp 0.5s ease ${index * 30}ms both` }}
            >
              <button
                onClick={() => selectCell(selectedCellId === cell.id ? null : cell.id)}
                className={`
                  w-full aspect-square rounded-lg border-2 transition-all duration-300
                  ${statusColors[cell.status]}
                  ${selectedCellId === cell.id ? 'ring-4 ring-stone-400 scale-110 z-10' : ''}
                  hover:scale-105 hover:shadow-lg
                  flex flex-col items-center justify-center
                  cursor-pointer relative overflow-hidden
                `}
              >
                <span className="text-white font-bold text-sm drop-shadow-md">
                  {cell.cellNumber}
                </span>
                <span className="text-white/80 text-[10px] drop-shadow">
                  {MATERIAL_NAMES[cell.material]}
                </span>

                {cell.status === 'occupied' && (
                  <span className="absolute top-1 right-1 text-xs">🐝</span>
                )}
                {cell.status === 'underObservation' && (
                  <span className="absolute top-1 right-1 text-xs">👀</span>
                )}
              </button>

              {hoveredCell === cell.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-48 p-3 bg-stone-800 text-white text-xs rounded-lg shadow-xl">
                  <div className="font-bold mb-1">{cell.cellNumber}</div>
                  <div className="space-y-0.5 text-stone-300">
                    <div>材料: {MATERIAL_NAMES[cell.material]}</div>
                    <div>朝向: {ORIENTATION_NAMES[cell.orientation]}</div>
                    <div>高度: {HEIGHT_NAMES[cell.height]}</div>
                    <div>状态: {statusLabels[cell.status]}</div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-stone-800" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedCell && (
        <div className="mt-6 p-5 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                {selectedCell.cellNumber}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCell.status === 'occupied'
                      ? 'bg-green-100 text-green-700'
                      : selectedCell.status === 'underObservation'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {STATUS_NAMES[selectedCell.status]}
                </span>
              </h3>
              <p className="text-sm text-stone-500 mt-1">
                登记于 {formatDateDisplay(selectedCell.registeredAt)}
              </p>
            </div>
            <button
              onClick={() => selectCell(null)}
              className="p-1 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-white rounded-lg">
              <div className="text-xs text-stone-500">材料</div>
              <div className="font-medium text-stone-800">{MATERIAL_NAMES[selectedCell.material]}</div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="text-xs text-stone-500">朝向</div>
              <div className="font-medium text-stone-800">{ORIENTATION_NAMES[selectedCell.orientation]}</div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="text-xs text-stone-500">高度</div>
              <div className="font-medium text-stone-800">{HEIGHT_NAMES[selectedCell.height]}</div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="text-xs text-stone-500">遮雨</div>
              <div className="font-medium text-stone-800">{selectedCell.hasRainProtection ? '有' : '无'}</div>
            </div>
            <div className="p-3 bg-white rounded-lg col-span-2">
              <div className="text-xs text-stone-500">周边植物</div>
              <div className="font-medium text-stone-800">
                {selectedCell.surroundingPlants.join('、')}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleRecordObservation(selectedCell.id)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            记录今日观察
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
