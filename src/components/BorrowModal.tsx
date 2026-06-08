import React, { useState } from 'react'
import { X, User, Calendar, Coins } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Equipment } from '../store/types'

interface BorrowModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: Equipment | null
}

const BorrowModal: React.FC<BorrowModalProps> = ({ isOpen, onClose, equipment }) => {
  const borrowEquipment = useStore((s) => s.borrowEquipment)

  const today = new Date().toISOString().split('T')[0]

  const [borrowerName, setBorrowerName] = useState('')
  const [borrowDate, setBorrowDate] = useState(today)
  const [plannedReturnDate, setPlannedReturnDate] = useState('')
  const [hasDeposit, setHasDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  if (!isOpen || !equipment) return null

  const handleSubmit = () => {
    if (!borrowerName.trim() || !plannedReturnDate) return

    borrowEquipment({
      equipmentId: equipment.id,
      borrowerName,
      borrowDate,
      plannedReturnDate,
      hasDeposit,
      depositAmount: hasDeposit ? depositAmount : 0,
      quantity,
      status: 'borrowed',
      notes,
    })

    setBorrowerName('')
    setBorrowDate(today)
    setPlannedReturnDate('')
    setHasDeposit(false)
    setDepositAmount(0)
    setQuantity(1)
    setNotes('')
    onClose()
  }

  const handleCancel = () => {
    setBorrowerName('')
    setBorrowDate(today)
    setPlannedReturnDate('')
    setHasDeposit(false)
    setDepositAmount(0)
    setQuantity(1)
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-cream-50 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-earth-500">
            借用登记
          </h2>
          <button onClick={handleCancel} className="text-earth-400 hover:text-earth-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-cream-100 rounded-lg">
          <p className="text-earth-600 font-medium">{equipment.name}</p>
          <p className="text-sm text-earth-400">可用数量: {equipment.availableQuantity}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1 text-sm text-earth-500 mb-1">
              <User size={14} />
              借用人姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="camp-input"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm text-earth-500 mb-1">
              <Calendar size={14} />
              借用日期
            </label>
            <input
              type="date"
              value={borrowDate}
              onChange={(e) => setBorrowDate(e.target.value)}
              className="camp-input"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm text-earth-500 mb-1">
              <Calendar size={14} />
              计划归还日期 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={plannedReturnDate}
              onChange={(e) => setPlannedReturnDate(e.target.value)}
              className="camp-input"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-earth-500">是否收取押金</span>
            <button
              type="button"
              onClick={() => setHasDeposit(!hasDeposit)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                hasDeposit ? 'bg-earth-400' : 'bg-earth-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  hasDeposit ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {hasDeposit && (
            <div>
              <label className="flex items-center gap-1 text-sm text-earth-500 mb-1">
                <Coins size={14} />
                押金金额
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="camp-input"
                min={0}
              />
            </div>
          )}

          <div>
            <label className="text-sm text-earth-500 mb-1 block">借用数量</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="camp-input"
              min={1}
              max={equipment.availableQuantity}
            />
          </div>

          <div>
            <label className="text-sm text-earth-500 mb-1 block">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="camp-input"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleCancel} className="camp-btn-secondary flex-1">
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="camp-btn-primary flex-1"
            disabled={!borrowerName.trim() || !plannedReturnDate}
          >
            确认借用
          </button>
        </div>
      </div>
    </div>
  )
}

export default BorrowModal
