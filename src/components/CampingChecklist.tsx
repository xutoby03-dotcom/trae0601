import { useStore } from '../store/useStore'
import type { Equipment, BorrowRecord } from '../store/types'
import { getMissingEssentials } from '../utils/essentialItems'
import { CATEGORY_LABELS, STATUS_LABELS } from '../store/types'
import {
  Minus,
  Plus,
  X,
  AlertTriangle,
  ClipboardList,
  Trash2,
  User,
  Calendar,
  Package,
} from 'lucide-react'

interface CampingChecklistProps {
  onBorrowClick: (equipment: Equipment) => void
  onReturnClick: (record: BorrowRecord, equipment: Equipment) => void
}

export function CampingChecklist({ onBorrowClick, onReturnClick }: CampingChecklistProps) {
  const equipment = useStore((s) => s.equipment)
  const borrowRecords = useStore((s) => s.borrowRecords)
  const currentTrip = useStore((s) => s.currentTrip)
  const updateChecklistQuantity = useStore((s) => s.updateChecklistQuantity)
  const removeFromChecklist = useStore((s) => s.removeFromChecklist)
  const clearChecklist = useStore((s) => s.clearChecklist)

  if (!currentTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
        <ClipboardList className="w-16 h-16 mb-4 opacity-30" />
        <p className="font-display text-lg font-semibold mb-1">尚无露营行程</p>
        <p className="text-sm">请先创建行程或选择场景模板</p>
      </div>
    )
  }

  const selectedItems = currentTrip.selectedEquipment
    .map((se) => {
      const eq = equipment.find((e) => e.id === se.equipmentId)
      return eq ? { equipment: eq, quantity: se.quantity } : null
    })
    .filter(Boolean) as { equipment: Equipment; quantity: number }[]

  const missingItems = getMissingEssentials(
    currentTrip.selectedEquipment,
    equipment,
    currentTrip.scene
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold text-earth-500 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          本次清单
        </h2>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <button onClick={clearChecklist} className="camp-btn-danger text-xs flex items-center gap-1">
              <Trash2 className="w-3 h-3" />
              清空
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2 font-body">
        {currentTrip.name} · {currentTrip.date || '未定日期'}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <AlertTriangle className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">从左侧装备库拖入装备</p>
            <p className="text-xs mt-1">或从场景页面生成清单</p>
          </div>
        ) : (
          selectedItems.map(({ equipment: eq, quantity }) => {
            const activeBorrow = borrowRecords.find(
              (r) => r.equipmentId === eq.id && r.status !== 'returned'
            )
            const isOverdue = eq.status === 'overdue' || activeBorrow?.status === 'overdue'

            return (
              <div
                key={eq.id}
                className={`camp-card p-3 ${isOverdue ? 'border-sunset-400 bg-sunset-50/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-cream-200">
                    {eq.photo ? (
                      <img src={eq.photo} alt={eq.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{eq.name}</span>
                      {isOverdue && (
                        <span className="camp-badge-overdue">逾期</span>
                      )}
                      {eq.status === 'borrowed' && !isOverdue && (
                        <span className="camp-badge-borrowed">借出</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {CATEGORY_LABELS[eq.category]}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateChecklistQuantity(eq.id, quantity - 1)}
                      className="w-6 h-6 rounded-md bg-cream-200 hover:bg-cream-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateChecklistQuantity(eq.id, quantity + 1)}
                      className="w-6 h-6 rounded-md bg-cream-200 hover:bg-cream-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {eq.status === 'available' && (
                      <button
                        onClick={() => onBorrowClick(eq)}
                        className="w-7 h-7 rounded-md bg-earth-100 hover:bg-earth-200 flex items-center justify-center transition-colors"
                        title="借出"
                      >
                        <User className="w-3.5 h-3.5 text-earth-600" />
                      </button>
                    )}
                    {activeBorrow && (
                      <button
                        onClick={() => onReturnClick(activeBorrow, eq)}
                        className="w-7 h-7 rounded-md bg-forest-50 hover:bg-forest-100 flex items-center justify-center transition-colors"
                        title="归还"
                      >
                        <Calendar className="w-3.5 h-3.5 text-forest-600" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromChecklist(eq.id)}
                      className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {activeBorrow && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded ${isOverdue ? 'bg-sunset-100 text-sunset-600' : 'bg-earth-50 text-earth-600'}`}>
                    借用人: {activeBorrow.borrowerName} · 归还: {activeBorrow.plannedReturnDate}
                    {activeBorrow.hasDeposit && ` · 押金: ¥${activeBorrow.depositAmount}`}
                  </div>
                )}

                {eq.notes && (
                  <div className="mt-1 text-xs text-gray-400 px-2 truncate">{eq.notes}</div>
                )}
              </div>
            )
          })
        )}
      </div>

      {missingItems.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-sunset-50 border border-sunset-200">
          <div className="flex items-center gap-1.5 text-sunset-500 font-medium text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>缺少必需品</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-sunset-100 text-sunset-600 px-2.5 py-0.5 text-xs font-medium"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          已选 {selectedItems.length} 件装备
          {missingItems.length > 0 && ` · 缺少 ${missingItems.length} 项必需品`}
        </div>
      )}
    </div>
  )
}
