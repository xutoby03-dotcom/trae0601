import {
  format,
  parseISO,
  addDays,
  isToday,
  isPast,
  isFuture,
  differenceInDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, fmt: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
}

export function formatDateChinese(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'M月d日', { locale: zhCN });
}

export function addDaysToString(dateStr: string, days: number): string {
  const date = parseISO(dateStr);
  return format(addDays(date, days), 'yyyy-MM-dd');
}

export function isDateToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function isDatePast(dateStr: string): boolean {
  return isPast(parseISO(dateStr));
}

export function isDateFuture(dateStr: string): boolean {
  return isFuture(parseISO(dateStr));
}

export function daysSince(dateStr: string): number {
  return differenceInDays(new Date(), parseISO(dateStr));
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
