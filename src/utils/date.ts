import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateCN = (date: string | Date): string => {
  return dayjs(date).format('M月D日');
};

export const getDaysDiff = (date1: string | Date, date2: string | Date = new Date()): number => {
  return dayjs(date1).diff(dayjs(date2), 'day');
};

export const getRemainingDays = (cookDate: string, expectedDays: number): number => {
  const expireDate = dayjs(cookDate).add(expectedDays, 'day');
  return expireDate.diff(dayjs(), 'day');
};

export const isExpiringSoon = (cookDate: string, expectedDays: number): boolean => {
  const remaining = getRemainingDays(cookDate, expectedDays);
  return remaining <= 1 && remaining >= 0;
};

export const isExpired = (cookDate: string, expectedDays: number): boolean => {
  return getRemainingDays(cookDate, expectedDays) < 0;
};

export const isTonightCandidate = (cookDate: string, expectedDays: number): boolean => {
  const remaining = getRemainingDays(cookDate, expectedDays);
  return remaining === 0 || remaining === 1;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
