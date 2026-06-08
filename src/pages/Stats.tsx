import { ROOMS, STATUS_CONFIG } from '@/types'
import { useRepairStore } from '@/store/repairStore'
import { getRoomName, getRoomIcon, formatCurrency, getDaysSince, formatRelativeTime } from '@/utils/format'
import { BarChart3, DollarSign, AlertTriangle, Clock, Wrench, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { motion } from 'framer-motion'

const PIE_COLORS = ['#E8652D', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#94A3B8']

export default function Stats() {
  const { orders } = useRepairStore()

  const currentYear = new Date().getFullYear()
  const yearOrders = orders.filter(
    (o) => new Date(o.createdAt).getFullYear() === currentYear
  )
  const completedOrders = yearOrders.filter((o) => o.status === 'completed')
  const totalCost = completedOrders.reduce(
    (sum, o) => sum + o.costs.reduce((s, c) => s + c.amount, 0),
    0
  )
  const avgCost = completedOrders.length > 0 ? totalCost / completedOrders.length : 0

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthOrders = completedOrders.filter(
      (o) => new Date(o.createdAt).getMonth() === i
    )
    return {
      name: `${i + 1}月`,
      费用: monthOrders.reduce(
        (sum, o) => sum + o.costs.reduce((s, c) => s + c.amount, 0),
        0
      ),
      工单数: monthOrders.length,
    }
  })

  const roomData = ROOMS.map((room) => ({
    name: room.name,
    value: orders.filter((o) => o.roomId === room.id).length,
  })).filter((r) => r.value > 0)

  const overdueOrders = orders
    .filter((o) => o.status === 'pending' || o.status === 'scheduled')
    .filter((o) => getDaysSince(o.createdAt) > 7)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dark-900">维修统计</h1>
        <p className="text-sm text-dark-700/60 mt-1">{currentYear} 年度维修数据概览</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-500" />
            </div>
            <span className="text-sm text-dark-700/60">年度总花费</span>
          </div>
          <div className="text-3xl font-bold text-dark-900">{formatCurrency(totalCost)}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-dark-700/60">工单总数</span>
          </div>
          <div className="text-3xl font-bold text-dark-900">{yearOrders.length}</div>
          <div className="text-xs text-dark-700/40 mt-1">
            已完成 {completedOrders.length} · 进行中 {yearOrders.length - completedOrders.length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm text-dark-700/60">平均费用</span>
          </div>
          <div className="text-3xl font-bold text-dark-900">
            {avgCost > 0 ? formatCurrency(Math.round(avgCost)) : '-'}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <h3 className="text-sm font-bold text-dark-900 mb-4">月度费用趋势</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #EBE3D5',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="费用" fill="#E8652D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h3 className="text-sm font-bold text-dark-900 mb-4">区域问题分布</h3>
          <div className="h-[240px] flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={roomData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roomData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {roomData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-dark-700/70 flex-1">{item.name}</span>
                  <span className="font-medium text-dark-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-dark-900">超时未处理工单</h3>
          <span className="badge bg-red-50 text-red-600">{overdueOrders.length}</span>
        </div>

        {overdueOrders.length > 0 ? (
          <div className="space-y-2">
            {overdueOrders.map((order) => {
              const days = getDaysSince(order.createdAt)
              const statusCfg = STATUS_CONFIG[order.status]
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-red-50/50 border border-red-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`badge ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-sm font-medium text-dark-900 truncate">
                      {order.title}
                    </span>
                    <span className="text-xs text-dark-700/40">
                      {getRoomName(order.roomId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600 font-medium shrink-0">
                    <Clock className="w-3 h-3" />
                    已 {days} 天
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-dark-700/40 text-sm">
            暂无超时工单，一切正常 👍
          </div>
        )}
      </motion.div>
    </div>
  )
}
