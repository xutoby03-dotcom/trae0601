import { format, differenceInDays, addDays, isBefore, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (dateStr: string, pattern: string = 'yyyy年MM月dd日'): string => {
  try {
    return format(new Date(dateStr), pattern, { locale: zhCN });
  } catch {
    return dateStr;
  }
};

export const formatRelative = (dateStr: string): string => {
  const days = differenceInDays(new Date(), new Date(dateStr));
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
};

export const daysBetween = (from: string, to: string = new Date().toISOString()): number => {
  return differenceInDays(startOfDay(new Date(to)), startOfDay(new Date(from)));
};

export const addDaysFromNow = (days: number): string => {
  return addDays(new Date(), days).toISOString();
};

export const isDateOverdue = (expectedDate?: string): boolean => {
  if (!expectedDate) return false;
  return isBefore(startOfDay(new Date(expectedDate)), startOfDay(new Date()));
};

export const todayISO = (): string => new Date().toISOString();

export const daysFromNow = (dateStr: string): number => {
  return differenceInDays(startOfDay(new Date(dateStr)), startOfDay(new Date()));
};
