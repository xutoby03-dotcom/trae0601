import type { FoodItem } from '../types'
import { formatExpiryLabel, daysUntilExpiry, isExpired } from '../types'
import { Clock, MapPin, AlertTriangle, Snowflake, PackageOpen, Users } from 'lucide-react'

interface Props {
  item: FoodItem
  onJoin: (item: FoodItem) => void
  onManage: (item: FoodItem) => void
}

function UrgencyBadge({ expiryDate }: { expiryDate: string }) {
  if (isExpired(expiryDate)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-500">
        已过期
      </span>
    )
  }
  const days = daysUntilExpiry(expiryDate)
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 urgent-pulse">
        🔴 今天到期
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
        🟠 {formatExpiryLabel(expiryDate)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700">
      🟡 {formatExpiryLabel(expiryDate)}
    </span>
  )
}

function SafetyBadges({ item }: { item: FoodItem }) {
  const badges = []
  if (item.isOpened) {
    badges.push(
      <span key="opened" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
        <PackageOpen size={10} /> 已开封
      </span>
    )
  }
  if (item.coldChainRequired) {
    badges.push(
      <span key="cold" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
        <Snowflake size={10} /> 需冷链
      </span>
    )
  }
  if (item.allergyWarning) {
    badges.push(
      <span key="allergy" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
        <AlertTriangle size={10} /> {item.allergyWarning}
      </span>
    )
  }
  if (badges.length === 0) return null
  return <div className="flex flex-wrap gap-1 mt-1.5">{badges}</div>
}

function StatusBadge({ status }: { status: FoodItem['status'] }) {
  const config: Record<FoodItem['status'], { label: string; className: string }> = {
    grouping: { label: '拼单中', className: 'bg-green-100 text-green-700' },
    pendingPickup: { label: '待取货', className: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', className: 'bg-gray-100 text-gray-500' },
    expired: { label: '已过期', className: 'bg-gray-200 text-gray-400' },
    open: { label: '发布中', className: 'bg-green-100 text-green-700' },
  }
  const { label, className } = config[status]
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{label}</span>
}

export default function FoodCard({ item, onJoin, onManage }: Props) {
  const expired = isExpired(item.expiryDate)
  const canJoin = item.status === 'grouping' && !expired && item.currentQuantity < item.quantity
  const isPublisher = item.publisherId === 'user_me'
  const days = daysUntilExpiry(item.expiryDate)
  const urgencyClass = expired
    ? 'opacity-60'
    : days === 0
      ? 'ring-2 ring-red-300 bg-red-50/30'
      : days <= 3
        ? 'ring-1 ring-orange-200 bg-orange-50/30'
        : ''

  return (
    <div className={`rounded-xl border border-warm-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow slide-in ${urgencyClass}`}>
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-3xl flex-shrink-0 border border-orange-100">
          {item.photo || '🛒'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">{item.name}</h3>
            <UrgencyBadge expiryDate={item.expiryDate} />
          </div>
          <SafetyBadges item={item} />
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{item.pickupLocation}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="flex-shrink-0" />
              <span>{item.publisherAvatar} {item.publisherName} 发布</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">¥{item.sharePrice}</span>
          <span className="text-xs text-gray-400 line-through">原价 ¥{item.originalPrice}</span>
          <span className="text-xs text-green-600 font-medium">省 ¥{(item.originalPrice - item.sharePrice).toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            <span>{item.currentQuantity}/{item.quantity}份</span>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </div>

      {item.orders.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {item.orders.map(order => (
              <span
                key={order.id}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${
                  order.pickedUp
                    ? 'bg-green-50 text-green-600'
                    : order.noShow
                      ? 'bg-red-50 text-red-500'
                      : 'bg-blue-50 text-blue-600'
                }`}
              >
                {order.userAvatar} {order.userName} ×{order.quantity}
                {order.pickedUp && ' ✓'}
                {order.noShow && ' ✗'}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {canJoin && !isPublisher && (
          <button
            onClick={() => onJoin(item)}
            className="flex-1 py-2 px-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            我要拼单
          </button>
        )}
        {(isPublisher && (item.status === 'pendingPickup' || item.status === 'grouping')) && (
          <button
            onClick={() => onManage(item)}
            className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            管理拼单
          </button>
        )}
        {expired && (
          <div className="flex-1 py-2 px-3 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg text-center">
            ⚠️ 已过保质期，不可拼单
          </div>
        )}
        {!canJoin && !expired && item.status === 'grouping' && !isPublisher && (
          <div className="flex-1 py-2 px-3 bg-orange-50 text-primary text-sm font-medium rounded-lg text-center">
            已满份，关注后续
          </div>
        )}
        {item.status === 'pendingPickup' && !isPublisher && (
          <div className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg text-center">
            📦 待取货中
          </div>
        )}
        {item.status === 'completed' && (
          <div className="flex-1 py-2 px-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg text-center">
            ✅ 已完成
          </div>
        )}
      </div>
    </div>
  )
}
