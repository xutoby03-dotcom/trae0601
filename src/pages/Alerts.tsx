import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { formatDateTime } from '@/utils/helpers'
import type { RiskSeverity, RiskType } from '@/types'

const TYPE_LABELS: Record<RiskType, string> = {
  'no-host-confirm': '接待人未确认',
  'room-conflict': '会议室冲突',
  'badge-not-returned': '访客牌未归还',
  'overtime-stay': '超时停留',
}

const SEVERITY_ORDER: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 }

const SEVERITY_COLORS: Record<RiskSeverity, string> = {
  high: 'border-red-500',
  medium: 'border-orange-400',
  low: 'border-yellow-400',
}

const SEVERITY_BADGES: Record<RiskSeverity, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-yellow-100 text-yellow-700',
}

type StatusFilter = 'all' | 'unresolved' | 'resolved'
type SeverityFilter = 'all' | RiskSeverity

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')

  const riskAlerts = useStore((s) => s.riskAlerts)
  const resolveRisk = useStore((s) => s.resolveRisk)
  const getEmployee = useStore((s) => s.getEmployee)
  const getMeetingRoom = useStore((s) => s.getMeetingRoom)
  const appointments = useStore((s) => s.appointments)
  const visitors = useStore((s) => s.visitors)

  const unresolvedCount = riskAlerts.filter((r) => !r.resolved).length

  const filtered = useMemo(() => {
    let list = [...riskAlerts]

    if (statusFilter === 'unresolved') list = list.filter((r) => !r.resolved)
    if (statusFilter === 'resolved') list = list.filter((r) => r.resolved)

    if (severityFilter !== 'all') list = list.filter((r) => r.severity === severityFilter)

    list.sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
      if (SEVERITY_ORDER[a.severity] !== SEVERITY_ORDER[b.severity])
        return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return list
  }, [riskAlerts, statusFilter, severityFilter])

  const getRelatedInfo = (alert: (typeof riskAlerts)[0]) => {
    const parts: string[] = []
    if (alert.relatedVisitorId) {
      const visitor = visitors.find((v) => v.id === alert.relatedVisitorId)
      if (visitor) parts.push(`访客: ${visitor.name}`)
    }
    if (alert.relatedAppointmentId) {
      const apt = appointments.find((a) => a.id === alert.relatedAppointmentId)
      if (apt) {
        const host = getEmployee(apt.hostId)
        const room = getMeetingRoom(apt.meetingRoomId)
        parts.push(`预约: ${apt.visitorName} - ${apt.purpose}`)
        if (host) parts.push(`接待人: ${host.name}`)
        if (room) parts.push(`会议室: ${room.name}`)
      }
    }
    return parts
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">风险提醒</h1>
        {unresolvedCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {unresolvedCount}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([
            ['all', '全部'],
            ['unresolved', '未处理'],
            ['resolved', '已处理'],
          ] as [StatusFilter, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === val
                  ? 'bg-white text-teal-600 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([
            ['all', '全部'],
            ['high', '高'],
            ['medium', '中'],
            ['low', '低'],
          ] as [SeverityFilter, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSeverityFilter(val)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                severityFilter === val
                  ? 'bg-white text-teal-600 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => {
          const relatedInfo = getRelatedInfo(alert)
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl p-4 border-l-4 ${SEVERITY_COLORS[alert.severity]} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${SEVERITY_BADGES[alert.severity]}`}>
                  {alert.severity === 'high' ? '高' : alert.severity === 'medium' ? '中' : '低'}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {TYPE_LABELS[alert.type]}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {formatDateTime(alert.createdAt)}
                </span>
              </div>

              <p className={`text-sm text-gray-800 ${alert.resolved ? 'line-through text-gray-400' : ''}`}>
                {alert.message}
              </p>

              {relatedInfo.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {relatedInfo.map((info, i) => (
                    <span key={i}>{info}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex justify-end">
                {alert.resolved ? (
                  <span className="text-xs font-medium px-3 py-1 rounded bg-gray-100 text-gray-400">
                    已处理
                  </span>
                ) : (
                  <button
                    onClick={() => resolveRisk(alert.id)}
                    className="text-xs font-medium px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                  >
                    处理
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">暂无风险提醒</div>
        )}
      </div>
    </div>
  )
}
