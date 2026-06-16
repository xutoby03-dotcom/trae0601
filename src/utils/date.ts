import {
  format as dateFnsFormat,
  parseISO,
  isDate,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isToday,
  isYesterday,
  isTomorrow,
  isThisYear,
  getDay,
  getDaysInMonth,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

type DateInput = Date | string | number

function parseDate(date: DateInput): Date {
  if (isDate(date)) return date
  if (typeof date === 'number') return new Date(date)
  return parseISO(date)
}

export function format(date: DateInput, pattern: string = 'yyyy-MM-dd HH:mm:ss'): string {
  try {
    const d = parseDate(date)
    return dateFnsFormat(d, pattern, { locale: zhCN })
  } catch {
    return ''
  }
}

export function formatDate(date: DateInput): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDateTime(date: DateInput): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

export function formatTime(date: DateInput): string {
  return format(date, 'HH:mm:ss')
}

export function formatRelative(date: DateInput): string {
  try {
    const d = parseDate(date)
    const now = new Date()
    const diffSeconds = differenceInSeconds(now, d)
    const diffMinutes = differenceInMinutes(now, d)
    const diffHours = differenceInHours(now, d)
    const diffDays = differenceInDays(now, d)

    if (diffSeconds < 60) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    if (isThisYear(d)) return format(d, 'MM-dd')
    return format(d, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export function add(date: DateInput, amount: number, unit: 'day' | 'hour' | 'minute' | 'month' | 'year'): Date {
  const d = parseDate(date)
  switch (unit) {
    case 'day':
      return addDays(d, amount)
    case 'hour':
      return addHours(d, amount)
    case 'minute':
      return addMinutes(d, amount)
    case 'month':
      return addMonths(d, amount)
    case 'year':
      return addYears(d, amount)
    default:
      return d
  }
}

export function diff(
  date1: DateInput,
  date2: DateInput,
  unit: 'day' | 'hour' | 'minute' | 'second' = 'day'
): number {
  const d1 = parseDate(date1)
  const d2 = parseDate(date2)
  switch (unit) {
    case 'day':
      return differenceInDays(d1, d2)
    case 'hour':
      return differenceInHours(d1, d2)
    case 'minute':
      return differenceInMinutes(d1, d2)
    case 'second':
      return differenceInSeconds(d1, d2)
    default:
      return 0
  }
}

export function getDayRange(date: DateInput): { start: Date; end: Date } {
  const d = parseDate(date)
  return {
    start: startOfDay(d),
    end: endOfDay(d),
  }
}

export function getMonthRange(date: DateInput): { start: Date; end: Date } {
  const d = parseDate(date)
  return {
    start: startOfMonth(d),
    end: endOfMonth(d),
  }
}

export function getWeekday(date: DateInput): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = parseDate(date)
  return weekdays[getDay(d)]
}

export function getDaysCount(date: DateInput): number {
  const d = parseDate(date)
  return getDaysInMonth(d)
}

export { isToday, isYesterday, isTomorrow }
