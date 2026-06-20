import dayjs from 'dayjs';

export const formatDateTime = (date: string | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

export const formatDate = (date: string | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date | dayjs.Dayjs, format: string = 'HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

export const getToday = (): dayjs.Dayjs => {
  return dayjs().startOf('day');
};

export const getDaysAgo = (days: number): dayjs.Dayjs => {
  return dayjs().subtract(days, 'day').startOf('day');
};

export const addDays = (date: string | Date | dayjs.Dayjs, days: number): dayjs.Dayjs => {
  return dayjs(date).add(days, 'day');
};

export const getDurationHours = (start: string | Date | dayjs.Dayjs, end: string | Date | dayjs.Dayjs): number => {
  const startMs = dayjs(start).valueOf();
  const endMs = dayjs(end).valueOf();
  const diffMs = Math.max(0, endMs - startMs);
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
};

export const isSameDay = (date1: string | Date | dayjs.Dayjs, date2: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

export const isToday = (date: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const getDateRange = (startDate: string | Date | dayjs.Dayjs, endDate: string | Date | dayjs.Dayjs): string[] => {
  const dates: string[] = [];
  let current = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return dates;
};
