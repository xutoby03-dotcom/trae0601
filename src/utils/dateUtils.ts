import {
  isToday,
  isPast,
  isFuture,
  differenceInDays,
  addDays,
  format,
  parseISO,
  startOfDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy年MM月dd日', { locale: zhCN });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MM/dd', { locale: zhCN });
  } catch {
    return dateStr;
  }
}

export function isTodayOrPast(dateStr: string): boolean {
  try {
    const date = startOfDay(parseISO(dateStr));
    const today = startOfDay(new Date());
    return date <= today;
  } catch {
    return false;
  }
}

export function isPastDeadline(dateStr: string): boolean {
  try {
    return isPast(parseISO(dateStr)) && !isToday(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function isTodayDeadline(dateStr: string): boolean {
  try {
    return isToday(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function daysUntil(dateStr: string): number {
  try {
    return differenceInDays(startOfDay(parseISO(dateStr)), startOfDay(new Date()));
  } catch {
    return 0;
  }
}

export function getDeadlineStatus(dateStr: string): 'urgent' | 'warning' | 'normal' {
  const days = daysUntil(dateStr);
  if (days <= 0) return 'urgent';
  if (days <= 2) return 'warning';
  return 'normal';
}

export function addDaysFromNow(days: number): string {
  return format(addDays(new Date(), days), 'yyyy-MM-dd');
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatRelativeDate(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === -1) return '昨天';
  if (days > 0) return `${days}天后`;
  return `${Math.abs(days)}天前`;
}

export interface RefundProgress {
  elapsedDays: number;
  promisedDays: number;
  remainingDays: number;
  overdueDays: number;
  isOverdue: boolean;
  isNearDue: boolean;
  percent: number;
}

export function getRefundProgress(
  applyDate: string | undefined,
  promisedDays: number
): RefundProgress | null {
  if (!applyDate) return null;
  try {
    const elapsed = differenceInDays(startOfDay(new Date()), startOfDay(parseISO(applyDate)));
    const elapsedDays = Math.max(0, elapsed);
    const remaining = promisedDays - elapsedDays;
    const isOverdue = remaining < 0;
    const overdueDays = isOverdue ? Math.abs(remaining) : 0;
    const remainingDays = isOverdue ? 0 : remaining;
    const isNearDue = !isOverdue && remaining >= 0 && remaining <= 2;
    const percent = Math.min(100, Math.round((elapsedDays / Math.max(1, promisedDays)) * 100));
    return {
      elapsedDays,
      promisedDays,
      remainingDays,
      overdueDays,
      isOverdue,
      isNearDue,
      percent,
    };
  } catch {
    return null;
  }
}
