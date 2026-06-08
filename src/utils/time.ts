import { isToday, isTomorrow, isThisWeek, format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export type TimeGroup = 'today' | 'tomorrow' | 'thisWeek' | 'past'

export function getTimeGroup(dateStr: string): TimeGroup {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'today'
  if (isTomorrow(date)) return 'tomorrow'
  if (isThisWeek(date)) return 'thisWeek'
  return 'past'
}

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  today: '今天',
  tomorrow: '明天',
  thisWeek: '本周',
  past: '已过期',
}

export function formatDepartureTime(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(date, 'HH:mm', { locale: zhCN })
}

export function formatFullDate(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(date, 'M月d日 HH:mm', { locale: zhCN })
}

export function formatMessageTime(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(date, 'M/d HH:mm', { locale: zhCN })
}

export function isDeparted(dateStr: string): boolean {
  return parseISO(dateStr) < new Date()
}
