import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatDisposalTime(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return '今天'
  if (isTomorrow(date)) return '明天'
  return format(date, 'M月d日', { locale: zhCN })
}

export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日 HH:mm', { locale: zhCN })
}

export function getDayLabel(dayOfWeek: number): string {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return labels[dayOfWeek] || ''
}

export function getCurrentDayOfWeek(): number {
  return new Date().getDay()
}

export function isCurrentWeek(dateStr: string): boolean {
  const date = parseISO(dateStr)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  return date >= weekStart && date < weekEnd
}
