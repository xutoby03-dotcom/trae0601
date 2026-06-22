import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import type { Cell, CellMaterial, Orientation, HeightLevel } from '../types'
import {
  MATERIAL_NAMES,
  ORIENTATION_NAMES,
  HEIGHT_NAMES,
  PLANT_OPTIONS,
} from '../types'

interface CellFormProps {
  cell?: Cell | null
  onSubmit: (data: Omit<Cell, 'id' | 'status' | 'registeredAt' | 'lastObservedAt'>) => void
  onCancel: () => void
}

export function CellForm({ cell, onSubmit, onCancel }: CellFormProps) {
  const [formData, setFormData] = useState({
    cellNumber: '',
    material: 'bamboo' as CellMaterial,
    orientation: 'south' as Orientation,
    height: 'middle' as HeightLevel,
    hasRainProtection: false,
    surroundingPlants: [] as string[],
  })

  useEffect(() => {
    if (cell) {
      setFormData({
        cellNumber: cell.cellNumber,
        material: cell.material,
        orientation: cell.orientation,
        height: cell.height,
        hasRainProtection: cell.hasRainProtection,
        surroundingPlants: cell.surroundingPlants,
      })
    }
  }, [cell])

  const handlePlantToggle = (plant: string) => {
    setFormData((prev) => ({
      ...prev,
      surroundingPlants: prev.surroundingPlants.includes(plant)
        ? prev.surroundingPlants.filter((p) => p !== plant)
        : [...prev.surroundingPlants, plant],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-stone-800">
            {cell ? '✏️ 编辑格口' : '➕ 新增格口'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              格口编号
            </label>
            <input
              type="text"
              value={formData.cellNumber}
              onChange={(e) => setFormData({ ...formData, cellNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              placeholder="如：A01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              材料类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MATERIAL_NAMES).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, material: value as CellMaterial })}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.material === value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              朝向
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ORIENTATION_NAMES).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, orientation: value as Orientation })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                    formData.orientation === value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              高度层级
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(HEIGHT_NAMES).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, height: value as HeightLevel })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                    formData.height === value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              遮雨设施
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasRainProtection: true })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                  formData.hasRainProtection
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                ☂️ 有遮雨
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasRainProtection: false })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                  !formData.hasRainProtection
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                ☀️ 无遮雨
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              周边植物（可多选）
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLANT_OPTIONS.map((plant) => (
                <button
                  key={plant}
                  type="button"
                  onClick={() => handlePlantToggle(plant)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                    formData.surroundingPlants.includes(plant)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  🌿 {plant}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {cell ? '保存修改' : '添加格口'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
