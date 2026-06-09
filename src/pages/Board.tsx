import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import type { Ticket, TicketStatus, Urgency } from '@/types'
import { STATUS_LABELS, URGENCY_LABELS } from '@/types'
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  ChevronRight,
  Timer,
} from 'lucide-react'

const statusConfig: Record<TicketStatus, { icon: typeof Clock; color: string; bg: string; border: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  repairing: { icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  procurement: { icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
}

const urgencyConfig: Record<Urgency, { color: string; bg: string; pulse: boolean }> = {
  urgent: { color: 'text-red-700', bg: 'bg-red-100', pulse: true },
  high: { color: 'text-orange-700', bg: 'bg-orange-100', pulse: false },
  normal: { color: 'text-slate-600', bg: 'bg-slate-100', pulse: false },
}

const urgencyOrder: Record<Urgency, number> = { urgent: 0, high: 1, normal: 2 }

function formatTimeLeft(isoStr: string) {
  const diff = new Date(isoStr).getTime() - Date.now()
  if (diff <= 0) return '已过期'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}小时${minutes}分后`
  return `${minutes}分钟后`
}

function sortTickets(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    if (urgencyDiff !== 0) return urgencyDiff
    const aHasMeeting = !!a.affectedMeetingTime
    const bHasMeeting = !!b.affectedMeetingTime
    if (aHasMeeting && bHasMeeting) {
      return new Date(a.affectedMeetingTime).getTime() - new Date(b.affectedMeetingTime).getTime()
    }
    if (aHasMeeting) return -1
    if (bHasMeeting) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const rooms = useStore((s) => s.rooms)
  const room = rooms.find((r) => r.id === ticket.roomId)
  const urgency = urgencyConfig[ticket.urgency]

  return (
    <Link
      to={`/ticket/${ticket.id}`}
      className={`group relative block rounded-xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        ticket.urgency === 'urgent' ? 'border-red-200 shadow-red-100/50' : 'border-slate-200 shadow-sm'
      }`}
    >
      {ticket.urgency === 'urgent' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500 animate-pulse" />
      )}
      {ticket.urgency === 'high' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-orange-400" />
      )}

      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {room?.name || '未知会议室'}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${urgency.bg} ${urgency.color}`}
            >
              {urgency.pulse && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
              {URGENCY_LABELS[ticket.urgency]}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span>{room?.floor}</span>
            <span>·</span>
            <span>{ticket.equipmentType}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
      </div>

      <p className="mt-2 pl-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {ticket.faultDescription}
      </p>

      <div className="mt-3 flex items-center justify-between pl-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Timer className="h-3 w-3" />
          {new Date(ticket.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
        {ticket.affectedMeetingTime && (
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
            <Clock className="h-3 w-3" />
            {formatTimeLeft(ticket.affectedMeetingTime)}
          </span>
        )}
      </div>

      {ticket.assignee && (
        <div className="mt-2 pl-2 text-[11px] text-slate-400">
          接单人：{ticket.assignee}
        </div>
      )}
    </Link>
  )
}

function StatusColumn({ status }: { status: TicketStatus }) {
  const allTickets = useStore((s) => s.tickets)
  const tickets = useMemo(
    () => sortTickets(allTickets.filter((t) => t.status === status)),
    [allTickets, status]
  )
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex min-w-[320px] flex-1 flex-col">
      <div className={`mb-3 flex items-center gap-2 rounded-lg ${config.bg} px-3 py-2 ${config.border} border`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-sm font-semibold ${config.color}`}>{STATUS_LABELS[status]}</span>
        <span className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs font-bold ${config.bg} ${config.color} px-1.5`}>
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10">
            <Icon className="h-8 w-8 text-slate-200" />
            <p className="mt-2 text-xs text-slate-400">暂无工单</p>
          </div>
        ) : (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </div>
  )
}

export default function Board() {
  const allTickets = useStore((s) => s.tickets)
  const pendingCount = useMemo(() => allTickets.filter((t) => t.status === 'pending').length, [allTickets])
  const repairingCount = useMemo(() => allTickets.filter((t) => t.status === 'repairing').length, [allTickets])

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">报修工单看板</h2>
          <p className="mt-1 text-sm text-slate-500">实时追踪所有会议室设备报修进度</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm border border-slate-200">
            <span className="text-slate-500">工单总数</span>
            <span className="font-bold text-slate-900">{allTickets.length}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm border border-amber-200">
            <span className="text-amber-600">待处理</span>
            <span className="font-bold text-amber-700">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm border border-blue-200">
            <span className="text-blue-600">维修中</span>
            <span className="font-bold text-blue-700">{repairingCount}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <StatusColumn status="pending" />
        <StatusColumn status="repairing" />
        <StatusColumn status="resolved" />
        <StatusColumn status="procurement" />
      </div>
    </div>
  )
}
