import { useState } from 'react'
import type { FoodItem } from '../types'
import { useStore } from '../store/useStore'
import { X, Minus, Plus, Clock, MessageSquare, AlertTriangle } from 'lucide-react'

interface Props {
  item: FoodItem
  onClose: () => void
}

export default function GroupBuyModal({ item, onClose }: Props) {
  const { addOrder } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [pickupTime, setPickupTime] = useState('')
  const [message, setMessage] = useState('')
  const maxQty = item.quantity - item.currentQuantity

  const handleSubmit = () => {
    if (quantity < 1 || quantity > maxQty) return
    if (!pickupTime.trim()) return
    addOrder(item.id, quantity, pickupTime.trim(), message.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 slide-in max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">发起拼单</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-primary font-bold">¥{item.sharePrice}/份</span>
            <span className="text-xs text-gray-400">剩余 {maxQty} 份</span>
          </div>
        </div>

        {(item.isOpened || item.allergyWarning || item.coldChainRequired) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-1.5 text-amber-700 text-sm font-medium mb-1">
              <AlertTriangle size={14} />
              食品安全提示
            </div>
            <ul className="text-xs text-amber-600 space-y-1 ml-5 list-disc">
              {item.isOpened && <li>此食品已开封，请确认品质后领取</li>}
              {item.coldChainRequired && <li>此食品需要冷链运输，请尽快取货</li>}
              {item.allergyWarning && <li>过敏原提醒：{item.allergyWarning}</li>}
            </ul>
          </div>
        )}

        <div className="space-y-4">
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
              <span className="text-xl font-bold text-gray-800 w-8 text-center">{quantity}</span>
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
              合计：<span className="font-bold text-primary">¥{(item.sharePrice * quantity).toFixed(1)}</span>
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
              placeholder="给发布者留个言吧…"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!pickupTime.trim() || quantity < 1}
          className="w-full mt-5 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
        >
          确认拼单
        </button>
      </div>
    </div>
  )
}
