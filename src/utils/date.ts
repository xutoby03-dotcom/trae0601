import type { Request, ConflictResult } from '@/types'

export function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateTimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function toDatetimeLocalInput(iso: string): string {
  return formatDateTimeLocal(new Date(iso))
}

export function calcHoursBetween(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  return Math.round((ms / (1000 * 60 * 60)) * 10) / 10
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function isOverdue(request: Request): boolean {
  if (request.status !== 'in_use') return false
  return new Date() > new Date(request.endTime)
}

export function overdueDuration(request: Request): string {
  const diff = new Date().getTime() - new Date(request.endTime).getTime()
  if (diff <= 0) return ''
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours < 1) return `${Math.floor(mins)}分钟`
  if (hours < 24) return `${hours}小时${Math.floor(mins % 60)}分`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24}小时`
}

export function checkTimeConflict(
  vehicleId: string,
  start: Date,
  end: Date,
  allRequests: Request[],
  excludeRequestId?: string,
): ConflictResult {
  const conflicting = allRequests.filter((r) => {
    if (r.vehicleId !== vehicleId) return false
    if (excludeRequestId && r.id === excludeRequestId) return false
    if (r.status !== 'approved' && r.status !== 'in_use') return false
    const rStart = new Date(r.startTime)
    const rEnd = new Date(r.endTime)
    return start.getTime() < rEnd.getTime() && end.getTime() > rStart.getTime()
  })
  if (conflicting.length > 0) {
    return { hasConflict: true, conflictingRequests: conflicting }
  }
  return { hasConflict: false }
}

export function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}
