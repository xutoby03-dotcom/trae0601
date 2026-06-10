import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (time: string): string => {
  return time;
};

export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const getTomorrow = (): string => {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
};

export const getWeekDates = (): string[] => {
  const dates: string[] = [];
  const startOfWeek = dayjs().startOf('week');
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};

export const getWeekDay = (date: string): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[dayjs(date).day()];
};

export const isToday = (date: string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isTomorrow = (date: string): boolean => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const isPast = (date: string): boolean => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const isFuture = (date: string): boolean => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

export const getDateLabel = (date: string): string => {
  if (isToday(date)) return '今天';
  if (isTomorrow(date)) return '明天';
  return getWeekDay(date);
};

export const generateWeekDates = (baseDate?: string): string[] => {
  const dates: string[] = [];
  const base = baseDate ? dayjs(baseDate) : dayjs();
  const startOfWeek = base.startOf('week');
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};
