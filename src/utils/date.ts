import { format, parseISO, differenceInDays, isBefore, isAfter, differenceInCalendarDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export { format, parseISO };

export const formatDate = (dateStr: string | null, formatStr: string = 'yyyy-MM-dd'): string => {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), formatStr, { locale: zhCN });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string | null): string => {
  return formatDate(dateStr, 'yyyy-MM-dd HH:mm');
};

export const formatRelative = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffDays = differenceInCalendarDays(now, date);
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  } catch {
    return dateStr;
  }
};

export const isOverdue = (expectedDate: string | null, status: string): boolean => {
  if (!expectedDate || status !== 'shipping') return false;
  try {
    const expected = parseISO(expectedDate);
    const now = new Date();
    return isBefore(expected, now);
  } catch {
    return false;
  }
};

export const getDaysRemaining = (expectedDate: string | null): number => {
  if (!expectedDate) return 0;
  try {
    return differenceInDays(parseISO(expectedDate), new Date());
  } catch {
    return 0;
  }
};

export const getTodayStr = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getDateRange = (days: number): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const isDateInRange = (dateStr: string, startDate: string, endDate: string): boolean => {
  try {
    const date = parseISO(dateStr);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    end.setHours(23, 59, 59);
    return !isBefore(date, start) && !isAfter(date, end);
  } catch {
    return false;
  }
};
