import { format, addDays, differenceInDays, parseISO, startOfYear, endOfYear, eachMonthOfInterval, formatISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateDisplay = (date: string | Date): string => {
  return formatDate(date, 'yyyy年MM月dd日');
};

export const calculateExpectedExpireDate = (installDate: string, cycleDays: number): string => {
  const date = parseISO(installDate);
  const expireDate = addDays(date, cycleDays);
  return formatISO(expireDate, { representation: 'date' });
};

export const calculateRemainingDays = (expireDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expire = parseISO(expireDate);
  expire.setHours(0, 0, 0, 0);
  return differenceInDays(expire, today);
};

export const getUrgencyLevel = (remainingDays: number): 'normal' | 'warning' | 'urgent' => {
  if (remainingDays < 15) return 'urgent';
  if (remainingDays <= 30) return 'warning';
  return 'normal';
};

export const getMonthsOfYear = (): Date[] => {
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);
  return eachMonthOfInterval({ start, end });
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
