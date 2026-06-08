import { useState } from 'react'
import { useStore } from '../store/useStore'
import EquipmentCard from './EquipmentCard'
import CategoryFilter from './CategoryFilter'
import AddEquipmentModal from './AddEquipmentModal'
import type { Equipment, EquipmentCategory } from '../store/types'
import { Plus, Search, Package } from 'lucide-react'

interface EquipmentLibraryProps {
  onBorrowClick: (equipment: Equipment) => void
}

export function EquipmentLibrary({ onBorrowClick }: EquipmentLibraryProps) {
  const equipment = useStore((s) => s.equipment)
  const deleteEquipment = useStore((s) => s.deleteEquipment)
  const [activeCategory, setActiveCategory] = useState<EquipmentCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = equipment.filter((eq) => {
    if (activeCategory && eq.category !== activeCategory) return false
    if (searchQuery && !eq.name.includes(searchQuery)) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold text-forest-600 flex items-center gap-2">
          <Package className="w-6 h-6" />
          装备库
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="camp-btn-primary flex items-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          添加装备
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索装备..."
          className="camp-input pl-9"
        />
      </div>

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Package className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">没有找到装备</p>
          </div>
        ) : (
          filtered.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
            />
          ))
        )}
      </div>

      <AddEquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}
