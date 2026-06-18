import { format, parse, addMinutes, differenceInMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  let currentTime = parse(start, 'HH:mm', new Date());
  const endTime = parse(end, 'HH:mm', new Date());

  while (currentTime < endTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, intervalMinutes);
  }

  return slots;
}

export function calculateMinutesDiff(time1: string, time2: string): number {
  const t1 = parse(time1, 'HH:mm', new Date());
  const t2 = parse(time2, 'HH:mm', new Date());
  return differenceInMinutes(t2, t1);
}

export function formatDate(date: Date | string, pattern: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, { locale: zhCN });
}

export function formatDateChinese(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'M月d日 EEEE', { locale: zhCN });
}

export function formatDateTimeChinese(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'M月d日 HH:mm', { locale: zhCN });
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addMinutesToTime(time: string, minutes: number): string {
  const t = parse(time, 'HH:mm', new Date());
  return format(addMinutes(t, minutes), 'HH:mm');
}

export function isTimeBefore(time1: string, time2: string): boolean {
  const t1 = parse(time1, 'HH:mm', new Date());
  const t2 = parse(time2, 'HH:mm', new Date());
  return t1 < t2;
}

export function isTimeAfter(time1: string, time2: string): boolean {
  const t1 = parse(time1, 'HH:mm', new Date());
  const t2 = parse(time2, 'HH:mm', new Date());
  return t1 > t2;
}

export function getCurrentTimeString(): string {
  return format(new Date(), 'HH:mm');
}

export function canCheckIn(bookingTime: string, currentTime: string): boolean {
  const booking = parse(bookingTime, 'HH:mm', new Date());
  const current = parse(currentTime, 'HH:mm', new Date());
  const diff = differenceInMinutes(booking, current);
  return diff <= 15 && diff >= -15;
}

export function isOverdue(bookingTime: string, currentTime: string): boolean {
  const booking = parse(bookingTime, 'HH:mm', new Date());
  const current = parse(currentTime, 'HH:mm', new Date());
  return differenceInMinutes(current, booking) > 15;
}

export function getTimeRemaining(endTime: string, currentTime: string): { minutes: number; isUrgent: boolean } {
  const end = parse(endTime, 'HH:mm', new Date());
  const current = parse(currentTime, 'HH:mm', new Date());
  const minutes = differenceInMinutes(end, current);
  return {
    minutes: Math.max(0, minutes),
    isUrgent: minutes <= 10 && minutes > 0,
  };
}
