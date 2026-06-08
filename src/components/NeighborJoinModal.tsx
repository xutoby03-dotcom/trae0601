import { useState, useMemo } from 'react'
import type { FoodItem } from '../types'
import { useStore, NEIGHBORS } from '../store/useStore'
import { X, Minus, Plus, Clock, MessageSquare, UserPlus } from 'lucide-react'

interface Props {
  item: FoodItem
  onClose: () => void
}

export default function NeighborJoinModal({ item, onClose }: Props) {
  const { addNeighborOrder } = useStore()

  const alreadyJoinedIds = item.orders.map(o => o.userId)
  const availableNeighbors = useMemo(
    () => NEIGHBORS.filter(n => !alreadyJoinedIds.includes(n.id)),
    [alreadyJoinedIds.join(',')]
  )
  const maxQty = item.quantity - item.currentQuantity

  const [selectedNeighbor, setSelectedNeighbor] = useState(availableNeighbors[0] ?? NEIGHBORS[0])
  const [quantity, setQuantity] = useState(1)
  const [pickupTime, setPickupTime] = useState('')
  const [message, setMessage] = useState('')

  const isSelectedAvailable = availableNeighbors.some(n => n.id === selectedNeighbor.id)

  const safeQty = Math.min(quantity, maxQty, 1)
  const canSubmit = pickupTime.trim() && isSelectedAvailable && safeQty >= 1 && maxQty >= 1

  const handleSubmit = () => {
    if (!canSubmit) return
    addNeighborOrder(item.id, selectedNeighbor, safeQty, pickupTime.trim(), message.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 slide-in max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 inline-flex items-center gap-1.5">
            <UserPlus size={18} className="text-amber-500" />
            邻居来拼
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-primary font-bold">¥{item.sharePrice}/份</span>
            <span className="text-xs text-gray-400">剩余 {maxQty} 份可拼</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">选择邻居</label>
            {availableNeighbors.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">所有邻居都已参与拼单</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableNeighbors.map(neighbor => (
                  <button
                    key={neighbor.id}
                    type="button"
                    onClick={() => setSelectedNeighbor(neighbor)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedNeighbor.id === neighbor.id
                        ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-lg">{neighbor.avatar}</span>
                    {neighbor.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {availableNeighbors.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">选择份数</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-bold text-gray-800 w-8 text-center">{safeQty}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    disabled={quantity >= maxQty}
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-sm text-gray-400 ml-2">最多 {maxQty} 份</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  合计：<span className="font-bold text-primary">¥{(item.sharePrice * safeQty).toFixed(1)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Clock size={14} className="inline mr-1" />
                  取货时间 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  placeholder="例如：今天18:00-19:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare size={14} className="inline mr-1" />
                  留言
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="替邻居留个言…"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full mt-2 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
              >
                确认邻居拼单
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          💡 模拟邻居拼单，方便测试满份→待取货→确认取货流程
        </p>
      </div>
    </div>
  )
}
