import type { VehicleStatus, RequestStatus } from '@/types'
import {
  VEHICLE_STATUS_LABEL,
  REQUEST_STATUS_LABEL,
} from '@/types'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, Clock, XCircle, KeyRound, Archive } from 'lucide-react'

const vehicleStatusStyles: Record<VehicleStatus, string> = {
  available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  maintenance:
    'bg-amber-50 text-amber-700 border border-amber-200',
  disabled: 'bg-slate-100 text-slate-500 border border-slate-200',
}

const requestStatusStyles: Record<RequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved:
    'bg-primary-50 text-primary-700 border border-primary-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  in_use: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  returned: 'bg-slate-100 text-slate-600 border border-slate-200',
}

const requestStatusIcons: Record<RequestStatus, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  in_use: KeyRound,
  returned: Archive,
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const Icon =
    status === 'available'
      ? CheckCircle2
      : status === 'maintenance'
        ? Clock
        : XCircle
  return (
    <span className={`badge ${vehicleStatusStyles[status]}`}>
      <Icon size={12} />
      {VEHICLE_STATUS_LABEL[status]}
    </span>
  )
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const Icon = requestStatusIcons[status]
  return (
    <span className={`badge ${requestStatusStyles[status]}`}>
      <Icon size={12} />
      {REQUEST_STATUS_LABEL[status]}
    </span>
  )
}

export function StatusBadge({
  tone = 'default', children }: { tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent'; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-primary-50 text-primary-700 border border-primary-200',
    accent: 'bg-accent-50 text-accent-700 border border-accent-200',
  }
  return <span className={`badge ${tones[tone]}`}>{children}</span>
}
