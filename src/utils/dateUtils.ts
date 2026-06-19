import { format, addDays, differenceInDays, startOfDay, isBefore, isAfter, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  return format(new Date(date), pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
};

export const addDaysToDate = (date: string | Date, days: number): string => {
  return format(addDays(new Date(date), days), 'yyyy-MM-dd');
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(expiryDate));
  return differenceInDays(expiry, today);
};

export const isExpired = (expiryDate: string): boolean => {
  return isBefore(startOfDay(new Date(expiryDate)), startOfDay(new Date()));
};

export const isNearExpiry = (expiryDate: string, days: number = 3): boolean => {
  const daysLeft = getDaysUntilExpiry(expiryDate);
  return daysLeft >= 0 && daysLeft <= days;
};

export const isClearance = (expiryDate: string): boolean => {
  const daysLeft = getDaysUntilExpiry(expiryDate);
  return daysLeft >= 0 && daysLeft <= 1;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};
