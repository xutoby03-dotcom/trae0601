import { format, formatDistanceToNow, differenceInDays, differenceInHours, isToday, isTomorrow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TimeSlot } from '@shared/types.js';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  return format(new Date(date), pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

export const getTimeSlotLabel = (slot: TimeSlot): string => {
  const labels: Record<TimeSlot, string> = {
    morning: '早 (6:00-9:00)',
    afternoon: '午 (14:00-17:00)',
    evening: '晚 (18:00-21:00)',
  };
  return labels[slot];
};

export const getDayLabel = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return '今天';
  if (isTomorrow(d)) return '明天';
  return format(d, 'EEEE', { locale: zhCN });
};

export const getWeekDates = (startDate?: Date): Date[] => {
  const start = startDate || new Date();
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() - start.getDay() + 1);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export const getHoursSince = (date: string | Date): number => {
  return differenceInHours(new Date(), new Date(date));
};

export const getDaysSince = (date: string | Date): number => {
  return differenceInDays(new Date(), new Date(date));
};

export const getNextWateringDate = (lastWatered: string | Date, frequency: number): Date => {
  const next = new Date(lastWatered);
  next.setDate(next.getDate() + frequency);
  return next;
};

export const isTimeToWater = (lastWatered: string | Date, frequency: number): boolean => {
  const hoursSince = getHoursSince(lastWatered);
  return hoursSince >= frequency * 24;
};

export const getMonthDates = (year: number, month: number): Date[] => {
  const dates: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  return dates;
};

export const calculateGrowthProgress = (plantDate: string, growthCycleDays: number): number => {
  const daysSincePlanted = differenceInDays(new Date(), new Date(plantDate));
  const progress = (daysSincePlanted / growthCycleDays) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export const formatChineseDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy年MM月dd日 EEEE', { locale: zhCN });
};

export const getWeekDateStrings = (startDateStr?: string): string[] => {
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() - start.getDay() + 1);
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(formatDate(date));
  }
  return dates;
};
