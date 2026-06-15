import {
  format,
  parseISO,
  differenceInDays,
  differenceInMinutes,
  addDays,
  isBefore,
  isToday,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateStr: string | null, pattern: string = 'yyyy-MM-dd'): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), pattern, { locale: zhCN });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null): string {
  return formatDate(dateStr, 'MM-dd HH:mm');
}

export function formatFullDateTime(dateStr: string | null): string {
  return formatDate(dateStr, 'yyyy年MM月dd日 HH:mm');
}

export function getDaysSinceLastWash(lastWashDate: string | null): number {
  if (!lastWashDate) return -1;
  return differenceInDays(new Date(), parseISO(lastWashDate));
}

export function getNextWashDate(lastWashDate: string | null, cycleDays: number): string | null {
  if (!lastWashDate) return null;
  return addDays(parseISO(lastWashDate), cycleDays).toISOString();
}

export function isOverdueForWash(lastWashDate: string | null, cycleDays: number): boolean {
  const nextDate = getNextWashDate(lastWashDate, cycleDays);
  if (!nextDate) return false;
  return isBefore(parseISO(nextDate), new Date());
}

export function getDurationMinutes(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  return differenceInMinutes(parseISO(end), parseISO(start));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getNowStr(): string {
  return new Date().toISOString();
}

export function isOver30Days(dateStr: string | null): boolean {
  if (!dateStr) return true;
  return differenceInDays(new Date(), parseISO(dateStr)) > 30;
}

export function daysUntilNextWash(lastWashDate: string | null, cycleDays: number): number {
  const nextDate = getNextWashDate(lastWashDate, cycleDays);
  if (!nextDate) return -1;
  return differenceInDays(parseISO(nextDate), new Date());
}

export function getWashStatusText(lastWashDate: string | null, cycleDays: number): string {
  const days = daysUntilNextWash(lastWashDate, cycleDays);
  if (days < 0) return `已逾期${Math.abs(days)}天`;
  if (days === 0) return '今日需清洗';
  if (days <= 7) return `${days}天后需清洗`;
  return `还剩${days}天`;
}

export function getMonthKey(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy-MM');
}

export function isThisMonth(dateStr: string): boolean {
  return getMonthKey(dateStr) === getMonthKey(new Date().toISOString());
}
