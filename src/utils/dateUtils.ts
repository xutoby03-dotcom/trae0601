import {
  format,
  parseISO,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  addDays,
  isBefore,
  isAfter,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateReadable = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'M月d日 EEEE', { locale: zhCN });
};

export const daysUntilDeadline = (deadline: string): number => {
  return differenceInDays(parseISO(deadline), new Date());
};

export const isThisWeek = (date: string): boolean => {
  const d = parseISO(date);
  const now = new Date();
  return isWithinInterval(d, {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  });
};

export const isExpiringSoon = (deadline: string, days: number = 7): boolean => {
  const deadlineDate = parseISO(deadline);
  const threshold = addDays(new Date(), days);
  return isBefore(deadlineDate, threshold) && isAfter(deadlineDate, new Date());
};

export const isOverdue = (deadline: string): boolean => {
  return isBefore(parseISO(deadline), new Date());
};

export const isLongPending = (createdAt: string, days: number = 14): boolean => {
  const created = parseISO(createdAt);
  return differenceInDays(new Date(), created) > days;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
