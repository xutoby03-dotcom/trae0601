import type { Booking } from '../types';
import { storage } from './storage';
import { calculateMinutesDiff, getTodayString } from './timeUtils';

export function generateBookingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function validateBookingDuration(
  phone: string,
  date: string,
  startTime: string,
  endTime: string
): { valid: boolean; message?: string } {
  const durationMinutes = calculateMinutesDiff(startTime, endTime);
  const durationHours = durationMinutes / 60;

  if (durationHours > 2) {
    return {
      valid: false,
      message: '单次预约不能超过2小时',
    };
  }

  const bookings = storage.getBookings();
  const userTodayBookings = bookings.filter(
    (b) => b.phone === phone && b.date === date && b.status !== 'cancelled' && b.status !== 'no-show'
  );

  let totalMinutes = durationMinutes;
  for (const booking of userTodayBookings) {
    totalMinutes += calculateMinutesDiff(booking.startTime, booking.endTime);
  }

  if (totalMinutes > 180) {
    return {
      valid: false,
      message: '同一天预约累计不能超过3小时',
    };
  }

  return { valid: true };
}

export function checkTimeConflict(
  tableId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): boolean {
  const bookings = storage.getBookings();
  const tableBookings = bookings.filter(
    (b) =>
      b.tableId === tableId &&
      b.date === date &&
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.status !== 'completed' &&
      b.status !== 'no-show'
  );

  for (const booking of tableBookings) {
    if (
      (startTime >= booking.startTime && startTime < booking.endTime) ||
      (endTime > booking.startTime && endTime <= booking.endTime) ||
      (startTime <= booking.startTime && endTime >= booking.endTime)
    ) {
      return true;
    }
  }

  return false;
}

export function getBookingsForTableAndDate(tableId: string, date: string): Booking[] {
  const bookings = storage.getBookings();
  return bookings.filter(
    (b) =>
      b.tableId === tableId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.status !== 'no-show'
  );
}

export function getTodayBookings(): Booking[] {
  const today = getTodayString();
  const bookings = storage.getBookings();
  return bookings.filter((b) => b.date === today);
}

export function getNoShowRecords(): { phone: string; count: number; lastDate: string }[] {
  const bookings = storage.getBookings();
  const noShowMap = new Map<string, { count: number; lastDate: string }>();

  for (const booking of bookings) {
    if (booking.status === 'no-show') {
      const existing = noShowMap.get(booking.phone) || { count: 0, lastDate: '' };
      noShowMap.set(booking.phone, {
        count: existing.count + 1,
        lastDate: existing.lastDate > booking.date ? existing.lastDate : booking.date,
      });
    }
  }

  return Array.from(noShowMap.entries())
    .map(([phone, data]) => ({ phone, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function getHotSlots(dateFrom: string, dateTo: string): { slot: string; count: number }[] {
  const bookings = storage.getBookings();
  const slotCount = new Map<string, number>();

  for (const booking of bookings) {
    if (booking.date >= dateFrom && booking.date <= dateTo && booking.status !== 'cancelled') {
      let time = booking.startTime;
      while (time < booking.endTime) {
        const current = slotCount.get(time) || 0;
        slotCount.set(time, current + 1);
        const [h, m] = time.split(':').map(Number);
        const newM = m + 30;
        const newH = h + Math.floor(newM / 60);
        time = `${String(newH).padStart(2, '0')}:${String(newM % 60).padStart(2, '0')}`;
      }
    }
  }

  return Array.from(slotCount.entries())
    .map(([slot, count]) => ({ slot, count }))
    .sort((a, b) => a.slot.localeCompare(b.slot));
}

export function updateOverdueBookings(): void {
  const bookings = storage.getBookings();
  const today = getTodayString();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let updated = false;
  for (const booking of bookings) {
    if (booking.status === 'pending' && booking.date === today) {
      const [bh, bm] = booking.startTime.split(':').map(Number);
      const [ch, cm] = currentTime.split(':').map(Number);
      const diffMinutes = (ch * 60 + cm) - (bh * 60 + bm);
      
      if (diffMinutes > 15) {
        booking.status = 'no-show';
        updated = true;
      }
    }
  }

  if (updated) {
    storage.setBookings(bookings);
  }
}
