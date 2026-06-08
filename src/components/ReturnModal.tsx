import { useState } from 'react'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { BorrowRecord, Equipment } from '../store/types'

interface ReturnModalProps {
  isOpen: boolean
  onClose: () => void
  record: BorrowRecord | null
  equipment: Equipment | null
}

export default function ReturnModal({ isOpen, onClose, record, equipment }: ReturnModalProps) {
  const returnEquipment = useStore((s) => s.returnEquipment)

  const [isIntact, setIsIntact] = useState(true)
  const [damageDescription, setDamageDescription] = useState('')
  const [repairCost, setRepairCost] = useState(0)
  const [notes, setNotes] = useState('')

  if (!isOpen || !record || !equipment) return null

  const handleSubmit = () => {
    returnEquipment(record.id, {
      actualReturnDate: new Date().toISOString().split('T')[0],
      isIntact,
      damageDescription: isIntact ? '' : damageDescription,
      repairCost: isIntact ? 0 : repairCost,
    })
    onClose()
  }

  const handleReset = () => {
    setIsIntact(true)
    setDamageDescription('')
    setRepairCost(0)
    setNotes('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-cream-50 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-forest-600">归还登记</h2>
          <button onClick={handleClose} className="text-cream-300 hover:text-earth-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 space-y-1">
          <p className="font-body text-sm text-earth-600">
            <span className="text-earth-400">装备：</span>
            {equipment.name}
          </p>
          <p className="font-body text-sm text-earth-600">
            <span className="text-earth-400">借用人：</span>
            {record.borrowerName}
          </p>
        </div>

        <div className="mb-4">
          <p className="font-body text-sm font-medium text-earth-700 mb-2">是否完好归还？</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsIntact(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all duration-150 ${
                isIntact
                  ? 'bg-forest-50 text-forest-600 ring-2 ring-forest-400'
                  : 'bg-cream-100 text-earth-400 hover:bg-cream-200'
              }`}
            >
              <CheckCircle size={16} />
              完好
            </button>
            <button
              onClick={() => setIsIntact(false)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all duration-150 ${
                !isIntact
                  ? 'bg-sunset-50 text-sunset-500 ring-2 ring-sunset-400'
                  : 'bg-cream-100 text-earth-400 hover:bg-cream-200'
              }`}
            >
              <AlertTriangle size={16} />
              损坏
            </button>
          </div>
        </div>

        {!isIntact && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="font-body text-sm font-medium text-earth-700 mb-1 block">
                损坏描述
              </label>
              <textarea
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="camp-input min-h-[80px] resize-none"
                placeholder="请描述损坏情况"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-earth-700 mb-1 block">
                维修费用
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-earth-400">
                  ¥
                </span>
                <input
                  type="number"
                  min={0}
                  value={repairCost}
                  onChange={(e) => setRepairCost(Number(e.target.value))}
                  className="camp-input pl-7"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="font-body text-sm font-medium text-earth-700 mb-1 block">
            备注
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="camp-input min-h-[60px] resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleClose} className="camp-btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="camp-btn-primary">
            确认归还
          </button>
        </div>
      </div>
    </div>
  )
}
