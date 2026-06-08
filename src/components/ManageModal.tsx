import type { FoodItem } from '../types'
import { useStore } from '../store/useStore'
import { X, Check, UserX, Clock, MapPin } from 'lucide-react'

interface Props {
  item: FoodItem
  onClose: () => void
}

export default function ManageModal({ item, onClose }: Props) {
  const { confirmPickup, markNoShow } = useStore()

  const handleConfirm = (orderId: string) => {
    confirmPickup(item.id, orderId)
  }

  const handleNoShow = (orderId: string) => {
    markNoShow(item.id, orderId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 slide-in max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">管理拼单</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={12} /> {item.pickupLocation}</span>
            <span>{item.currentQuantity}/{item.quantity}份已拼</span>
          </div>
        </div>

        {item.orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            还没有人拼单，再等等吧~
          </div>
        ) : (
          <div className="space-y-3">
            {item.orders.map(order => (
              <div
                key={order.id}
                className={`rounded-lg border p-3 ${
                  order.pickedUp
                    ? 'border-green-200 bg-green-50'
                    : order.noShow
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{order.userAvatar}</span>
                    <div>
                      <span className="font-medium text-sm text-gray-800">{order.userName}</span>
                      <span className="text-xs text-gray-500 ml-2">×{order.quantity}份</span>
                    </div>
                  </div>
                  {order.pickedUp && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      已取货 ✓
                    </span>
                  )}
                  {order.noShow && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                      爽约 ✗
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={10} />
                  取货时间：{order.pickupTime}
                </div>
                {order.message && (
                  <div className="mt-1 text-xs text-gray-500">留言：{order.message}</div>
                )}
                {!order.pickedUp && !order.noShow && item.status !== 'completed' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check size={12} /> 确认取货
                    </button>
                    <button
                      onClick={() => handleNoShow(order.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <UserX size={12} /> 标记爽约
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          💡 提示：确认取货后，所有拼单者都已取货即自动标记为已完成。爽约者份额将释放回拼单池。
        </div>
      </div>
    </div>
  )
}
