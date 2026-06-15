import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Ticket as TicketIcon, Filter, Clock, User } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDateTime, formatRelativeTime } from '@/utils/date'
import type { Ticket } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const navigate = useNavigate()

  useEffect(() => {
    loadTickets()
  }, [statusFilter])

  const loadTickets = async () => {
    try {
      setLoading(true)
      let url = '/tickets'
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`
      }
      const data = await api.get<Ticket[]>(url)
      setTickets(data)
    } catch (error) {
      console.error('加载工单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '处理中' },
    { key: 'resolved', label: '已整改' },
    { key: 'closed', label: '已关闭' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工单..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新建工单
        </button>
      </div>

      <div className="flex gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ticket.priority === 'high'
                      ? 'bg-red-50'
                      : ticket.priority === 'medium'
                      ? 'bg-amber-50'
                      : 'bg-green-50'
                  }`}
                >
                  <TicketIcon
                    className={`w-6 h-6 ${
                      ticket.priority === 'high'
                        ? 'text-red-600'
                        : ticket.priority === 'medium'
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800 truncate">{ticket.title}</h4>
                    <StatusBadge type="status" value={ticket.status} />
                    <StatusBadge type="priority" value={ticket.priority} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ticket.building}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {ticket.assignee || '未指派'}
                    </span>
                    <span>{formatDateTime(ticket.created_at)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm text-gray-400">
                    {formatRelativeTime(ticket.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="text-center py-20">
          <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无工单</p>
        </div>
      )}
    </div>
  )
}
