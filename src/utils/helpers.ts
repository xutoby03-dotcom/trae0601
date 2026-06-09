export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

export function formatDuration(startTs: number, endTs: number): string {
  const diffMs = endTs - startTs
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  if (hours === 0) return `${minutes}分钟`
  if (minutes === 0) return `${hours}小时`
  return `${hours}小时${minutes}分`
}

export function calcShiftEarning(shift: { startTime: number; endTime: number; hourlyRate: number; transportFee: number; mealAllowance: number; lateDeduction: number }): number {
  const hours = (shift.endTime - shift.startTime) / 3600000
  return Math.max(0, hours * shift.hourlyRate + shift.transportFee + shift.mealAllowance - shift.lateDeduction)
}

export function isThisWeek(timestamp: number): boolean {
  const now = new Date()
  const d = new Date(timestamp)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return d >= startOfWeek && d < endOfWeek
}

export function isThisMonth(timestamp: number): boolean {
  const now = new Date()
  const d = new Date(timestamp)
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function isUpcoming(timestamp: number): boolean {
  const now = Date.now()
  const diff = timestamp - now
  return diff > 0 && diff <= 3600000
}

export function getWeekday(timestamp: number): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date(timestamp).getDay()]
}

export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

export function toLocalDateTimeInput(timestamp: number): string {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const mo = (d.getMonth() + 1).toString().padStart(2, '0')
  const da = d.getDate().toString().padStart(2, '0')
  const h = d.getHours().toString().padStart(2, '0')
  const mi = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${mo}-${da}T${h}:${mi}`
}

export function fromLocalDateTimeInput(value: string): number {
  return new Date(value).getTime()
}

export const JOB_COLORS = [
  '#F97316', '#22C55E', '#3B82F6', '#A855F7', '#EC4899',
  '#14B8A6', '#EAB308', '#EF4444', '#6366F1', '#06B6D4',
]
