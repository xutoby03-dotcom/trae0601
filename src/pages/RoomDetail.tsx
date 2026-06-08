import { useParams, useNavigate } from 'react-router-dom'
import { ROOMS, STATUS_CONFIG, URGENCY_CONFIG } from '@/types'
import { useRepairStore } from '@/store/repairStore'
import PageHeader from '@/components/PageHeader'
import { getRoomName, formatCurrency, formatRelativeTime } from '@/utils/format'
import StarRating from '@/components/StarRating'
import { motion } from 'framer-motion'
import { Clock, Wrench, DollarSign, Phone } from 'lucide-react'
import type { RoomId } from '@/types'

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { orders, contacts } = useRepairStore()

  const room = ROOMS.find((r) => r.id === roomId)
  const roomOrders = orders
    .filter((o) => o.roomId === roomId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const completedOrders = roomOrders.filter((o) => o.status === 'completed')
  const totalCost = completedOrders.reduce(
    (sum, o) => sum + o.costs.reduce((s, c) => s + c.amount, 0),
    0
  )
  const avgRating =
    completedOrders.filter((o) => o.rating > 0).length > 0
      ? completedOrders.filter((o) => o.rating > 0).reduce((s, o) => s + o.rating, 0) /
        completedOrders.filter((o) => o.rating > 0).length
      : 0

  if (!room) return <div className="p-6">未找到房间</div>

  return (
    <div>
      <PageHeader
        showBack
        title={room.name}
        subtitle={`共 ${roomOrders.length} 个维修问题`}
      />

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-xs text-dark-700/50 mb-1">总问题数</div>
            <div className="text-2xl font-bold text-dark-900">{roomOrders.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-dark-700/50 mb-1">处理中</div>
            <div className="text-2xl font-bold text-amber-600">
              {roomOrders.filter((o) => o.status !== 'completed').length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-dark-700/50 mb-1">累计花费</div>
            <div className="text-2xl font-bold text-dark-900">{formatCurrency(totalCost)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-dark-700/50 mb-1">平均评分</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-dark-900">
                {avgRating > 0 ? avgRating.toFixed(1) : '-'}
              </span>
              {avgRating > 0 && <StarRating rating={Math.round(avgRating)} size="sm" />}
            </div>
          </div>
        </div>

        <h2 className="text-base font-bold text-dark-900 mb-3">历史维修记录</h2>

        <div className="space-y-3">
          {roomOrders.map((order, i) => {
            const contact = order.contactId
              ? contacts.find((c) => c.id === order.contactId)
              : null
            const statusCfg = STATUS_CONFIG[order.status]
            const urgencyCfg = URGENCY_CONFIG[order.urgency]
            const orderCost = order.costs.reduce((s, c) => s + c.amount, 0)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/order/${order.id}`)}
                className="card p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`badge ${urgencyCfg.bg} ${urgencyCfg.color}`}>
                        {urgencyCfg.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-dark-900 truncate">{order.title}</h3>
                    <p className="text-xs text-dark-700/50 mt-0.5 line-clamp-1">{order.description}</p>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    {orderCost > 0 && (
                      <div className="text-sm font-bold text-dark-900">
                        {formatCurrency(orderCost)}
                      </div>
                    )}
                    <div className="text-xs text-dark-700/40 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(order.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-surface-100">
                  {contact && (
                    <div className="flex items-center gap-1 text-xs text-dark-700/60">
                      <Wrench className="w-3 h-3" />
                      {contact.name}
                    </div>
                  )}
                  {order.rating > 0 && (
                    <StarRating rating={order.rating} size="sm" />
                  )}
                </div>
              </motion.div>
            )
          })}

          {roomOrders.length === 0 && (
            <div className="text-center py-12 text-dark-700/40 text-sm">
              该房间暂无维修记录
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
