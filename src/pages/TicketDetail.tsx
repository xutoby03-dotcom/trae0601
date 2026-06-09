import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store'
import { STATUS_LABELS, URGENCY_LABELS } from '@/types'
import {
  ArrowLeft,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Package,
  Calendar,
  Camera,
  Timer,
  Send,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react'

const statusIcons = {
  pending: Clock,
  repairing: Wrench,
  resolved: CheckCircle2,
  procurement: ShoppingCart,
}

const statusColors = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  repairing: 'text-blue-600 bg-blue-50 border-blue-200',
  resolved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  procurement: 'text-purple-600 bg-purple-50 border-purple-200',
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const ticket = useStore((s) => s.tickets.find((t) => t.id === id))
  const rooms = useStore((s) => s.rooms)
  const room = rooms.find((r) => r.id === ticket?.roomId)
  const updateTicket = useStore((s) => s.updateTicket)
  const acceptTicket = useStore((s) => s.acceptTicket)
  const resolveTicket = useStore((s) => s.resolveTicket)
  const moveToProcurement = useStore((s) => s.moveToProcurement)

  const [assignee, setAssignee] = useState('')
  const [faultCause, setFaultCause] = useState(ticket?.faultCause || '')
  const [solution, setSolution] = useState(ticket?.solution || '')
  const [needVendor, setNeedVendor] = useState(ticket?.needVendor || false)
  const [estimatedRecovery, setEstimatedRecovery] = useState(ticket?.estimatedRecovery || '')
  const [lightboxIdx, setLightboxIdx] = useState(-1)

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-slate-200" />
        <p className="mt-3 text-sm text-slate-400">工单不存在</p>
        <Link to="/" className="mt-3 text-sm text-blue-600 hover:underline">
          返回看板
        </Link>
      </div>
    )
  }

  const StatusIcon = statusIcons[ticket.status]
  const statusClass = statusColors[ticket.status]

  const handleAccept = () => {
    if (!assignee.trim()) return
    acceptTicket(ticket.id, assignee.trim())
  }

  const handleSaveProgress = () => {
    updateTicket(ticket.id, { faultCause, solution, needVendor, estimatedRecovery })
    if (needVendor) {
      moveToProcurement(ticket.id)
    }
  }

  const handleResolve = () => {
    updateTicket(ticket.id, { faultCause, solution, needVendor, estimatedRecovery })
    resolveTicket(ticket.id)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          返回看板
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{room?.name || '未知会议室'}</h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {STATUS_LABELS[ticket.status]}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  ticket.urgency === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : ticket.urgency === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {ticket.urgency === 'urgent' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                {URGENCY_LABELS[ticket.urgency]}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {ticket.equipmentType}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {new Date(ticket.createdAt).toLocaleString('zh-CN')}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                报修人：{ticket.reporter}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500">故障描述</div>
          <p className="mt-1 text-sm text-slate-900 leading-relaxed">{ticket.faultDescription}</p>
          {ticket.affectedMeetingTime && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                受影响会议时间：{new Date(ticket.affectedMeetingTime).toLocaleString('zh-CN')}
              </span>
            </div>
          )}
        </div>

        {ticket.photos.length > 0 ? (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Camera className="h-3.5 w-3.5" />
              故障照片 ({ticket.photos.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {ticket.photos.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIdx(idx)}
                  className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
                >
                  <img
                    src={src}
                    alt={`照片 ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <ZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Camera className="h-3.5 w-3.5" />
            暂无故障照片
          </div>
        )}

        {lightboxIdx >= 0 && ticket.photos.length > 0 && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setLightboxIdx(-1)}
          >
            <button
              onClick={() => setLightboxIdx(-1)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
              <img
                src={ticket.photos[lightboxIdx]}
                alt={`照片 ${lightboxIdx + 1}`}
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
              />
            </div>
            {ticket.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + ticket.photos.length) % ticket.photos.length) }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % ticket.photos.length) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  ›
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {lightboxIdx + 1} / {ticket.photos.length}
            </div>
          </div>
        )}

        {ticket.assignee && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Wrench className="h-4 w-4 text-blue-500" />
            <span className="text-slate-500">维修人员：</span>
            <span className="font-medium text-slate-900">{ticket.assignee}</span>
          </div>
        )}

        {ticket.status === 'pending' && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-base font-semibold text-slate-900">接单处理</h3>
            <p className="mt-1 text-sm text-slate-500">维修人员确认接单后，工单将变为"维修中"</p>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">维修人员姓名</label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="输入您的姓名"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <button
              onClick={handleAccept}
              disabled={!assignee.trim()}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              确认接单
            </button>
          </div>
        )}

        {(ticket.status === 'repairing' || ticket.status === 'procurement') && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-base font-semibold text-slate-900">维修记录</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">故障原因</label>
                <textarea
                  value={faultCause}
                  onChange={(e) => setFaultCause(e.target.value)}
                  placeholder="分析故障根本原因..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">处理办法</label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="描述处理方案和步骤..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">预计恢复时间</label>
                <input
                  type="datetime-local"
                  value={estimatedRecovery}
                  onChange={(e) => setEstimatedRecovery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNeedVendor(!needVendor)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    needVendor
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  需要外部供应商
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {ticket.status !== 'procurement' && (
                <button
                  onClick={handleSaveProgress}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  保存进度
                </button>
              )}
              {needVendor && ticket.status !== 'procurement' && (
                <button
                  onClick={() => {
                    updateTicket(ticket.id, { faultCause, solution, needVendor, estimatedRecovery })
                    moveToProcurement(ticket.id)
                  }}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
                >
                  <ShoppingCart className="h-4 w-4" />
                  转入采购
                </button>
              )}
              <button
                onClick={handleResolve}
                disabled={!faultCause.trim() || !solution.trim()}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
                标记已修好
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'resolved' && (
          <div className="mt-6 border-t border-emerald-100 pt-6">
            <h3 className="text-base font-semibold text-emerald-700">维修完成</h3>
            <div className="mt-4 space-y-3 rounded-xl bg-emerald-50 p-4">
              {ticket.faultCause && (
                <div>
                  <span className="text-xs text-emerald-600">故障原因</span>
                  <p className="mt-0.5 text-sm text-emerald-900">{ticket.faultCause}</p>
                </div>
              )}
              {ticket.solution && (
                <div>
                  <span className="text-xs text-emerald-600">处理办法</span>
                  <p className="mt-0.5 text-sm text-emerald-900">{ticket.solution}</p>
                </div>
              )}
              {ticket.needVendor && (
                <div className="flex items-center gap-1 text-sm text-purple-700">
                  <Truck className="h-4 w-4" />
                  需要了外部供应商
                </div>
              )}
              {ticket.completedAt && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  完成时间：{new Date(ticket.completedAt).toLocaleString('zh-CN')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
