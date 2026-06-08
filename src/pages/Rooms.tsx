import { useNavigate } from 'react-router-dom'
import { ROOMS, STATUS_CONFIG } from '@/types'
import type { RoomId } from '@/types'
import { useRepairStore } from '@/store/repairStore'
import { getRoomIcon, formatRelativeTime, formatCurrency } from '@/utils/format'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export default function Rooms() {
  const navigate = useNavigate()
  const { orders, contacts } = useRepairStore()

  const roomStats = ROOMS.map((room) => {
    const roomOrders = orders.filter((o) => o.roomId === room.id)
    const completedOrders = roomOrders.filter((o) => o.status === 'completed')
    const totalCost = completedOrders.reduce(
      (sum, o) => sum + o.costs.reduce((s, c) => s + c.amount, 0),
      0
    )
    const latestOrder = roomOrders.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]
    const contact = latestOrder?.contactId
      ? contacts.find((c) => c.id === latestOrder.contactId)
      : null

    return {
      ...room,
      orderCount: roomOrders.length,
      activeCount: roomOrders.filter((o) => o.status !== 'completed').length,
      totalCost,
      latestTime: latestOrder ? formatRelativeTime(latestOrder.updatedAt) : '',
      latestContact: contact?.name || '',
    }
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dark-900">房间视图</h1>
        <p className="text-sm text-dark-700/60 mt-1">按房间查看历史维修问题</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {roomStats.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="card p-5 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-100 transition-colors">
                {getRoomIcon(room.id as RoomId, 'w-5 h-5')}
              </div>
              <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-brand-500 transition-colors" />
            </div>

            <h3 className="text-base font-bold text-dark-900 mb-1">{room.name}</h3>

            <div className="flex items-center gap-3 text-xs text-dark-700/60 mb-3">
              <span>{room.orderCount} 个问题</span>
              {room.activeCount > 0 && (
                <span className="badge bg-amber-50 text-amber-600">
                  {room.activeCount} 处理中
                </span>
              )}
            </div>

            {room.totalCost > 0 && (
              <div className="text-xs text-dark-700/50 mb-1">
                累计花费 <span className="font-medium text-dark-900">{formatCurrency(room.totalCost)}</span>
              </div>
            )}

            {room.latestTime && (
              <div className="text-xs text-dark-700/40">
                最近维修 {room.latestTime}
                {room.latestContact && ` · ${room.latestContact}`}
              </div>
            )}

            {room.orderCount === 0 && (
              <div className="text-xs text-dark-700/30 mt-2">暂无维修记录</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
