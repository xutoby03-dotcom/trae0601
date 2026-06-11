import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TIME_SLOTS } from '@/types';

export const generateTimeSlots = (): string[] => {
  return [...TIME_SLOTS];
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  return format(date, 'M月d日', { locale: zhCN });
};

export const formatWeekday = (dateStr: string): string => {
  const date = parseISO(dateStr);
  return format(date, 'EEEE', { locale: zhCN });
};

export const formatShortWeekday = (dateStr: string): string => {
  const date = parseISO(dateStr);
  return format(date, 'EEE', { locale: zhCN });
};

export const getDaysOfWeek = (startDate?: Date): string[] => {
  const start = startOfWeek(startDate || new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => formatDate(addDays(start, i)));
};

export const getNext7Days = (): string[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => formatDate(addDays(today, i)));
};

export const isToday = (dateStr: string): boolean => {
  return isSameDay(parseISO(dateStr), new Date());
};

export const getTimeSlotStart = (timeSlot: string): string => {
  return timeSlot.split('-')[0];
};

export const getTimeSlotEnd = (timeSlot: string): string => {
  return timeSlot.split('-')[1];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const validateDailyBookingLimit = (
  studentName: string,
  date: string,
  bookings: { studentName: string; date: string; status: string }[]
): { valid: boolean; message?: string } => {
  const todayBookings = bookings.filter(
    b => b.studentName === studentName && b.date === date && b.status !== 'cancelled'
  );
  
  if (todayBookings.length >= 3) {
    return { valid: false, message: '同一天最多预约3个时段' };
  }
  
  return { valid: true };
};

export const validateConsecutiveBookings = (
  studentName: string,
  date: string,
  timeSlot: string,
  bookings: { studentName: string; date: string; timeSlot: string; status: string }[]
): { valid: boolean; message?: string } => {
  const todayBookings = bookings
    .filter(b => b.studentName === studentName && b.date === date && b.status !== 'cancelled')
    .map(b => b.timeSlot);
  
  todayBookings.push(timeSlot);
  todayBookings.sort();
  
  let consecutiveCount = 1;
  for (let i = 1; i < todayBookings.length; i++) {
    const prevEnd = getTimeSlotEnd(todayBookings[i - 1]);
    const currStart = getTimeSlotStart(todayBookings[i]);
    if (prevEnd === currStart) {
      consecutiveCount++;
      if (consecutiveCount > 2) {
        return { valid: false, message: '不能连续预约超过2个时段' };
      }
    } else {
      consecutiveCount = 1;
    }
  }
  
  return { valid: true };
};

export const getWaitlistPosition = (
  roomId: string,
  date: string,
  timeSlot: string,
  bookings: { roomId: string; date: string; timeSlot: string; isWaitlist: boolean; waitlistPosition?: number }[]
): number => {
  const waitlistBookings = bookings.filter(
    b => b.roomId === roomId && b.date === date && b.timeSlot === timeSlot && b.isWaitlist
  );
  return waitlistBookings.length + 1;
};

export const getSlotStatus = (
  roomId: string,
  date: string,
  timeSlot: string,
  bookings: { roomId: string; date: string; timeSlot: string; status: string; isWaitlist: boolean }[],
  roomStatus: string
): 'available' | 'booked' | 'waitlist_only' | 'blocked' => {
  if (roomStatus !== 'available') {
    return 'blocked';
  }
  
  const confirmedBookings = bookings.filter(
    b => b.roomId === roomId && b.date === date && b.timeSlot === timeSlot && 
         b.status === 'confirmed' && !b.isWaitlist
  );
  
  const waitlistBookings = bookings.filter(
    b => b.roomId === roomId && b.date === date && b.timeSlot === timeSlot && 
         b.status === 'waitlist' && b.isWaitlist
  );
  
  if (confirmedBookings.length >= 1) {
    return waitlistBookings.length >= 5 ? 'booked' : 'waitlist_only';
  }
  
  return 'available';
};
