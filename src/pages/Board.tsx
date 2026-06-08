import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATUS_CONFIG, URGENCY_CONFIG, ROOMS } from '@/types'
import type { OrderStatus } from '@/types'
import { getRoomName, formatCurrency, formatRelativeTime, getRoomIcon } from '@/utils/format'
import { useRepairStore } from '@/store/repairStore'

const STATUSES: OrderStatus[] = ['pending', 'scheduled', 'in_progress', 'completed']

export default function Board() {
  const navigate = useNavigate()
  const { orders, contacts } = useRepairStore()
  const [search, setSearch] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')

  const filtered = orders.filter((o) => {
    if (search && !o.title.includes(search) && !o.description.includes(search)) return false
    if (roomFilter && o.roomId !== roomFilter) return false
    if (urgencyFilter && o.urgency !== urgencyFilter) return false
    return true
  })

  const getContactName = (contactId: string) => {
    const c = contacts.find((ct) => ct.id === contactId)
    return c?.name || ''
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-10 bg-surface-50/80 backdrop-blur border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-dark-900">维修白板</h1>
          <button
            onClick={() => navigate('/order/new')}
            className="flex items-center gap-1 bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增工单
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索工单..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-dark-900"
            />
          </div>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">全部房间</option>
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">全部紧急度</option>
            {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex gap-3 p-4 overflow-x-auto min-h-[calc(100vh-120px)]">
        {STATUSES.map((status) => {
          const cfg = STATUS_CONFIG[status]
          const columnOrders = filtered.filter((o) => o.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-72 flex flex-col">
              <div className={`flex items-center gap-2 mb-3 px-1 ${cfg.color}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className="font-semibold text-sm">{cfg.label}</span>
                <span className="text-xs opacity-60">{columnOrders.length}</span>
              </div>
              <div className="flex-1 space-y-2">
                <AnimatePresence>
                  {columnOrders.map((order) => {
                    const urgency = URGENCY_CONFIG[order.urgency]
                    const contactName = getContactName(order.contactId)
                    const isUrgent = order.urgency === 'urgent'
                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => navigate(`/order/${order.id}`)}
                        className={`bg-white rounded-lg border ${cfg.border} p-3 cursor-pointer hover:shadow-md transition-shadow ${isUrgent ? 'border-l-4 border-l-red-500' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${urgency.bg} ${urgency.color} font-medium`}>
                            {urgency.label}
                          </span>
                          {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                          {getRoomIcon(order.roomId, 'w-3.5 h-3.5')}
                          <span>{getRoomName(order.roomId)}</span>
                        </div>
                        <h3 className="text-sm font-medium text-dark-900 mb-2 line-clamp-1">{order.title}</h3>
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span>{formatCurrency(order.estimatedCost)}</span>
                          <span>{formatRelativeTime(order.createdAt)}</span>
                        </div>
                        {contactName && (
                          <div className="mt-1.5 text-xs text-stone-400">
                            {contactName}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
