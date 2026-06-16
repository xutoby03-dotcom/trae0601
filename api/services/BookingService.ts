import dayjs from 'dayjs';
import { bookingRepository } from '../repositories/BookingRepository';
import { userRepository } from '../repositories/UserRepository';
import { chairRepository } from '../repositories/ChairRepository';
import { damageRepository } from '../repositories/DamageRepository';
import { Booking, CleanupConfirmRequest } from '../../shared/types';

export class BookingService {
  private readonly MAX_CONSECUTIVE_HOURS = 2;
  private readonly MIN_CREDIT_SCORE = 60;
  private readonly CHECKIN_BEFORE_MINUTES = 10;
  private readonly NO_SHOW_AFTER_MINUTES = 15;

  createBooking(
    userId: number,
    chairId: number,
    date: string,
    startTime: string,
    endTime: string
  ): { success: boolean; message?: string; bookingId?: number } {
    const user = userRepository.findById(userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    if (user.creditScore < this.MIN_CREDIT_SCORE) {
      return { success: false, message: `信用分不足，当前${user.creditScore}分，需要${this.MIN_CREDIT_SCORE}分以上才能预约` };
    }

    const chair = chairRepository.findById(chairId);
    if (!chair) {
      return { success: false, message: '躺椅不存在' };
    }

    if (chair.status === 'maintenance') {
      return { success: false, message: '该躺椅正在维护中' };
    }

    if (chair.status === 'dirty') {
      return { success: false, message: '该躺椅尚未清洁，暂不可预约' };
    }

    const conflicts = bookingRepository.findConflicting(chairId, date, startTime, endTime);
    if (conflicts.length > 0) {
      return { success: false, message: '该时段已被预约' };
    }

    const consecutiveBookings = bookingRepository.findUserConsecutiveBookings(
      userId,
      date,
      startTime,
      endTime
    );

    const allSlots = [...consecutiveBookings, { startTime, endTime }];
    const minTime = allSlots.reduce((min, b) => (b.startTime < min ? b.startTime : min), '23:59');
    const maxTime = allSlots.reduce((max, b) => (b.endTime > max ? b.endTime : max), '00:00');
    
    const durationMinutes = this.calculateDuration(minTime, maxTime);
    if (durationMinutes > this.MAX_CONSECUTIVE_HOURS * 60) {
      return { success: false, message: `连续使用时间不能超过${this.MAX_CONSECUTIVE_HOURS}小时` };
    }

    const bookingId = bookingRepository.create({
      userId,
      chairId,
      date,
      startTime,
      endTime,
    });

    return { success: true, bookingId };
  }

  private calculateDuration(start: string, end: string): number {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  }

  getUserBookings(userId: number): Booking[] {
    return bookingRepository.findByUserId(userId);
  }

  getBookingById(id: number): Booking | undefined {
    const booking = bookingRepository.findById(id);
    if (!booking) return undefined;

    if (booking.status === 'pending') {
      const now = dayjs();
      const bookingStart = dayjs(`${booking.date} ${booking.startTime}`);
      const diffMinutes = now.diff(bookingStart, 'minute');

      if (diffMinutes > this.NO_SHOW_AFTER_MINUTES) {
        bookingRepository.updateStatus(id, 'no_show');
        userRepository.deductCreditScore(booking.userId, 10);
        return bookingRepository.findById(id);
      }
    }

    return booking;
  }

  checkin(bookingId: number, userId: number): { success: boolean; message?: string } {
    const booking = bookingRepository.findById(bookingId);
    if (!booking) {
      return { success: false, message: '预约不存在' };
    }

    if (booking.userId !== userId) {
      return { success: false, message: '无权签到此预约' };
    }

    if (booking.status !== 'pending') {
      return { success: false, message: '当前状态无法签到' };
    }

    const now = dayjs();
    const bookingStart = dayjs(`${booking.date} ${booking.startTime}`);
    const diffMinutes = bookingStart.diff(now, 'minute');

    if (diffMinutes > this.CHECKIN_BEFORE_MINUTES) {
      return { success: false, message: `只能在预约开始前${this.CHECKIN_BEFORE_MINUTES}分钟内签到` };
    }

    if (diffMinutes < -this.NO_SHOW_AFTER_MINUTES) {
      bookingRepository.updateStatus(bookingId, 'no_show');
      userRepository.deductCreditScore(userId, 10);
      return { success: false, message: '已超过签到时间，预约已取消，信用分-10' };
    }

    bookingRepository.checkin(bookingId, now.format('YYYY-MM-DD HH:mm:ss'));
    chairRepository.updateStatus(booking.chairId, 'in_use');

    return { success: true, message: '签到成功' };
  }

  endUsage(bookingId: number, userId: number): { success: boolean; message?: string } {
    const booking = bookingRepository.findById(bookingId);
    if (!booking) {
      return { success: false, message: '预约不存在' };
    }

    if (booking.userId !== userId) {
      return { success: false, message: '无权操作此预约' };
    }

    if (booking.status !== 'checked_in') {
      return { success: false, message: '当前状态无法结束使用' };
    }

    const now = dayjs();
    bookingRepository.endUsage(bookingId, now.format('YYYY-MM-DD HH:mm:ss'));
    chairRepository.updateStatus(booking.chairId, 'dirty');

    return { success: true, message: '使用结束，请完成清洁确认' };
  }

  confirmCleanup(
    bookingId: number,
    userId: number,
    data: CleanupConfirmRequest
  ): { success: boolean; message?: string } {
    const booking = bookingRepository.findById(bookingId);
    if (!booking) {
      return { success: false, message: '预约不存在' };
    }

    if (booking.userId !== userId) {
      return { success: false, message: '无权操作此预约' };
    }

    if (booking.status !== 'completed' || booking.cleanupConfirmed) {
      return { success: false, message: '当前状态无法确认清洁' };
    }

    if (!data.folded || !data.cushionInPlace || !data.blanketReturned || !data.wipedClean) {
      return { success: false, message: '请完成所有清洁项确认' };
    }

    const now = dayjs();
    bookingRepository.confirmCleanup(bookingId, data.damageReported, data.damageNote);
    chairRepository.updateCleanInfo(booking.chairId, userId, now.format('YYYY-MM-DD HH:mm:ss'));
    chairRepository.updateStatus(booking.chairId, 'available');

    if (data.damageReported && data.damagePart) {
      damageRepository.create({
        chairId: booking.chairId,
        bookingId,
        reportedBy: userId,
        partName: data.damagePart,
        description: data.damageNote,
      });
    }

    return { success: true, message: '清洁确认完成，感谢您的配合' };
  }

  cancelBooking(bookingId: number, userId: number): { success: boolean; message?: string } {
    const booking = bookingRepository.findById(bookingId);
    if (!booking) {
      return { success: false, message: '预约不存在' };
    }

    if (booking.userId !== userId) {
      return { success: false, message: '无权取消此预约' };
    }

    if (booking.status !== 'pending') {
      return { success: false, message: '当前状态无法取消' };
    }

    bookingRepository.updateStatus(bookingId, 'cancelled');
    return { success: true, message: '预约已取消' };
  }

  processNoShows(): void {
    const pendingBookings = bookingRepository.findByUserId(0).filter(
      (b) => b.status === 'pending'
    );

    const now = dayjs();
    pendingBookings.forEach((booking) => {
      const bookingStart = dayjs(`${booking.date} ${booking.startTime}`);
      const diffMinutes = now.diff(bookingStart, 'minute');

      if (diffMinutes > this.NO_SHOW_AFTER_MINUTES) {
        bookingRepository.updateStatus(booking.id, 'no_show');
        userRepository.deductCreditScore(booking.userId, 10);
      }
    });
  }
}

export const bookingService = new BookingService();
