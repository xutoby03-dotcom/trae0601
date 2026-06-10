import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateChinese = (date: string | Date): string => {
  return dayjs(date).format('YYYY年M月D日');
};

export const daysBetween = (date1: string | Date, date2: string | Date): number => {
  return dayjs(date1).diff(dayjs(date2), 'day');
};

export const addDays = (date: string | Date, days: number): string => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
};

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isPast = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const isFuture = (date: string | Date): boolean => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

export const getDaysUntilNextClean = (
  lastCleanDate: string,
  suggestedCycleDays: number
): number => {
  const nextCleanDate = addDays(lastCleanDate, suggestedCycleDays);
  return daysBetween(nextCleanDate, new Date());
};

export const getNextCleanDate = (
  lastCleanDate: string,
  suggestedCycleDays: number
): string => {
  return addDays(lastCleanDate, suggestedCycleDays);
};

export const isRainyDay = (): boolean => {
  return false;
};

export const getWeekday = (date: string | Date): string => {
  return dayjs(date).format('dddd');
};

export const getMonthKey = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM');
};

export const isThisYear = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'year');
};

export { dayjs };
