import { Edit2, Trash2 } from 'lucide-react'
import type { Cell } from '../types'
import { MATERIAL_NAMES, HEIGHT_NAMES, ORIENTATION_NAMES, STATUS_NAMES } from '../types'
import { formatDateDisplay } from '../utils/dateUtils'

interface CellCardProps {
  cell: Cell
  onEdit: (cell: Cell) => void
  onDelete: (id: string) => void
}

export function CellCard({ cell, onEdit, onDelete }: CellCardProps) {
  const statusConfig = {
    occupied: { color: 'bg-green-100 text-green-700 border-green-300', icon: '🐝' },
    underObservation: { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '👀' },
    empty: { color: 'bg-stone-100 text-stone-600 border-stone-300', icon: '🔲' },
  }

  const config = statusConfig[cell.status]

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-4 hover:shadow-md transition-all duration-300 hover:border-stone-400">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-bold text-stone-800">{cell.cellNumber}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color}`}>
              {STATUS_NAMES[cell.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(cell)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-stone-500" />
          </button>
          <button
            onClick={() => onDelete(cell.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">材料</span>
          <span className="text-stone-800 font-medium">{MATERIAL_NAMES[cell.material]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">朝向</span>
          <span className="text-stone-800 font-medium">{ORIENTATION_NAMES[cell.orientation]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">高度</span>
          <span className="text-stone-800 font-medium">{HEIGHT_NAMES[cell.height]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">遮雨</span>
          <span className="text-stone-800 font-medium">{cell.hasRainProtection ? '有' : '无'}</span>
        </div>
        <div className="pt-2 border-t border-stone-100">
          <span className="text-stone-500 text-xs">周边植物：</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {cell.surroundingPlants.map((plant) => (
              <span
                key={plant}
                className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full"
              >
                {plant}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-2 text-xs text-stone-400">
          登记于 {formatDateDisplay(cell.registeredAt)}
        </div>
      </div>
    </div>
  )
}
