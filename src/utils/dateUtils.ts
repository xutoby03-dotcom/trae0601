import { CalendarConfig, TimeUnit } from '../types';

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isWorkDay = (date: Date, calendar: CalendarConfig): boolean => {
  const dayOfWeek = date.getDay();
  if (!calendar.workDays.includes(dayOfWeek)) return false;
  const dateStr = formatDate(date);
  return !calendar.holidays.includes(dateStr);
};

export const addWorkDays = (startDate: string, days: number, calendar: CalendarConfig): string => {
  const date = parseDate(startDate);
  let remaining = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;

  while (remaining > 0) {
    date.setDate(date.getDate() + direction);
    if (isWorkDay(date, calendar)) {
      remaining--;
    }
  }
  return formatDate(date);
};

export const getWorkDaysBetween = (start: string, end: string, calendar: CalendarConfig): number => {
  if (start === end) return 0;
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  let count = 0;
  const current = new Date(startDate);

  while (current < endDate) {
    current.setDate(current.getDate() + 1);
    if (isWorkDay(current, calendar)) {
      count++;
    }
  }
  return count;
};

export const addDays = (dateStr: string, days: number): string => {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

export const getDaysBetween = (start: string, end: string): number => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getWeekStart = (dateStr: string): string => {
  const date = parseDate(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return formatDate(new Date(date.getFullYear(), date.getMonth(), diff));
};

export const getMonthStart = (dateStr: string): string => {
  const date = parseDate(dateStr);
  return formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
};

export const getQuarterStart = (dateStr: string): string => {
  const date = parseDate(dateStr);
  const quarter = Math.floor(date.getMonth() / 3);
  return formatDate(new Date(date.getFullYear(), quarter * 3, 1));
};

export const getNextUnitDate = (dateStr: string, unit: TimeUnit): string => {
  const date = parseDate(dateStr);
  switch (unit) {
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() + 3);
      break;
  }
  return formatDate(date);
};

export const getUnitLabel = (dateStr: string, unit: TimeUnit): string => {
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  switch (unit) {
    case 'day':
      return `${month}/${day}`;
    case 'week':
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${month}/${day}-${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    case 'month':
      return `${year}年${month}月`;
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}Q${quarter}`;
  }
};

export const getToday = (): string => formatDate(new Date());

export const maxDate = (date1: string, date2: string): string => {
  return date1 > date2 ? date1 : date2;
};

export const minDate = (date1: string, date2: string): string => {
  return date1 < date2 ? date1 : date2;
};

export const isDateInRange = (date: string, start: string, end: string): boolean => {
  return date >= start && date <= end;
};
