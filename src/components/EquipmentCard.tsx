import { useDraggable } from '@dnd-kit/core'
import { Package, GripVertical } from 'lucide-react'
import type { Equipment } from '../store/types'
import { CATEGORY_LABELS, STATUS_LABELS } from '../store/types'
import { cn } from '../lib/utils'

const STATUS_BADGE_CLASS: Record<Equipment['status'], string> = {
  available: 'camp-badge-available',
  borrowed: 'camp-badge-borrowed',
  overdue: 'camp-badge-overdue',
  maintenance: 'camp-badge-maintenance',
}

interface EquipmentCardProps {
  equipment: Equipment
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `equipment-${equipment.id}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'camp-card flex items-center gap-3 p-3',
        isDragging && 'opacity-50',
        !isDragging && 'cursor-grab'
      )}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {equipment.photo ? (
          <img
            src={equipment.photo}
            alt={equipment.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-earth-50">
            <Package className="h-8 w-8 text-earth-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm">{equipment.name}</div>
        <div className="text-xs text-earth-500">
          {CATEGORY_LABELS[equipment.category]}
        </div>
        <div className="text-xs text-gray-600">
          可用 {equipment.availableQuantity} / 共 {equipment.totalQuantity}
        </div>
        <span className={cn(STATUS_BADGE_CLASS[equipment.status])}>
          {STATUS_LABELS[equipment.status]}
        </span>
        {equipment.notes && (
          <div className="truncate text-xs text-gray-500">{equipment.notes}</div>
        )}
      </div>

      <div
        className="flex-shrink-0 cursor-grab touch-none text-gray-400"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>
    </div>
  )
}
