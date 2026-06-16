import { format, addHours, differenceInHours, differenceInDays, isAfter, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDateTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatDate = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd', { locale: zhCN });
};

export const formatMonth = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM', { locale: zhCN });
};

export const getNow = (): string => {
  return new Date().toISOString();
};

export const addHoursToNow = (hours: number): string => {
  return addHours(new Date(), hours).toISOString();
};

export const isOverdue = (expectedReturn: string, overdueHours: number = 24): boolean => {
  const expected = parseISO(expectedReturn);
  const deadline = addHours(expected, overdueHours);
  return isAfter(new Date(), deadline);
};

export const getOverdueHours = (expectedReturn: string): number => {
  return Math.max(0, differenceInHours(new Date(), parseISO(expectedReturn)));
};

export const getOverdueDays = (expectedReturn: string): number => {
  return Math.max(0, differenceInDays(new Date(), parseISO(expectedReturn)));
};
