import { format, isBefore, isAfter, differenceInDays, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

export const isExpired = (expiryDate: string): boolean => {
  return isBefore(parseISO(expiryDate), new Date());
};

export const isExpiringSoon = (expiryDate: string, days: number = 30): boolean => {
  const expiry = parseISO(expiryDate);
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return isAfter(expiry, now) && isBefore(expiry, threshold);
};

export const daysUntilExpiry = (expiryDate: string): number => {
  return differenceInDays(parseISO(expiryDate), new Date());
};

export const getWeeksAgo = (weeks: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - weeks * 7);
  return date;
};

export const isWithinDays = (dateStr: string, days: number): boolean => {
  const date = parseISO(dateStr);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return isAfter(date, threshold);
};
