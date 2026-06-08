import { useState } from 'react'
import { X, Plus, Camera } from 'lucide-react'
import { useStore } from '../store/useStore'
import { EquipmentCategory, CATEGORY_LABELS } from '../store/types'

interface AddEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
}

const initialForm = {
  name: '',
  category: 'other' as EquipmentCategory,
  totalQuantity: 1,
  photo: '',
  notes: '',
}

export default function AddEquipmentModal({ isOpen, onClose }: AddEquipmentModalProps) {
  const addEquipment = useStore((s) => s.addEquipment)
  const [form, setForm] = useState(initialForm)

  const handleClose = () => {
    setForm(initialForm)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addEquipment({
      name: form.name.trim(),
      category: form.category,
      photo: form.photo,
      totalQuantity: form.totalQuantity,
      availableQuantity: form.totalQuantity,
      status: 'available',
      notes: form.notes,
    })
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-cream-50 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-forest-600">添加装备</h2>
          <button onClick={handleClose} className="text-forest-400 hover:text-forest-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1">装备名称</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="camp-input"
              placeholder="输入装备名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1">分类</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as EquipmentCategory })}
              className="camp-input"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1">数量</label>
            <input
              type="number"
              min={1}
              value={form.totalQuantity}
              onChange={(e) => setForm({ ...form, totalQuantity: Math.max(1, Number(e.target.value)) })}
              className="camp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1">照片链接</label>
            <div className="relative">
              <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                className="camp-input pl-9"
                placeholder="输入照片 URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="camp-input"
              rows={3}
              placeholder="输入备注信息"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="camp-btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="camp-btn-primary flex-1 flex items-center justify-center gap-1">
              <Plus size={16} />
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
