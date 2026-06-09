export function formatPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60)
  const sec = Math.round(secondsPerKm % 60)
  return `${min}'${sec.toString().padStart(2, '0')}"`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${m}m${s}s`
  return `${m}m${s}s`
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  const today = new Date()
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  if (isToday) return '今天'
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  if (isTomorrow) return '明天'
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function getTimeUntil(isoString: string): string {
  const now = new Date()
  const target = new Date(isoString)
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return '已开始'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `${hours}小时${minutes}分钟后`
  return `${minutes}分钟后`
}

export function paceDiff(pace1: number, pace2: number): number {
  return Math.abs(pace1 - pace2)
}

export function isLateNight(isoString: string): boolean {
  const hour = new Date(isoString).getHours()
  return hour >= 22 || hour < 5
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function getRouteTypeLabel(type: string): string {
  const map: Record<string, string> = {
    track: '操场',
    riverside: '河道',
    street: '街道',
    park: '公园',
  }
  return map[type] || type
}
