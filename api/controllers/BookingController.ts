import { Request, Response } from 'express';
import { bookingService } from '../services/BookingService';
import { ApiResponse, BookingCreateRequest, CleanupConfirmRequest } from '../../shared/types';

export class BookingController {
  async createBooking(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { chairId, date, startTime, endTime } = req.body as BookingCreateRequest;

      if (!chairId || !date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: '请填写完整信息',
        } as ApiResponse);
      }

      const result = bookingService.createBooking(
        userId,
        chairId,
        date,
        startTime,
        endTime
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: { bookingId: result.bookingId },
        message: '预约成功',
      } as ApiResponse);
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: '预约失败',
      } as ApiResponse);
    }
  }

  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const bookings = bookingService.getUserBookings(userId);

      res.json({
        success: true,
        data: bookings,
      } as ApiResponse);
    } catch (error) {
      console.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        message: '获取预约记录失败',
      } as ApiResponse);
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const booking = bookingService.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: '预约不存在',
        } as ApiResponse);
      }

      if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '无权查看此预约',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: booking,
      } as ApiResponse);
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: '获取预约详情失败',
      } as ApiResponse);
    }
  }

  async checkin(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = bookingService.checkin(id, userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: result.message,
      } as ApiResponse);
    } catch (error) {
      console.error('Checkin error:', error);
      res.status(500).json({
        success: false,
        message: '签到失败',
      } as ApiResponse);
    }
  }

  async endUsage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = bookingService.endUsage(id, userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: result.message,
      } as ApiResponse);
    } catch (error) {
      console.error('End usage error:', error);
      res.status(500).json({
        success: false,
        message: '结束使用失败',
      } as ApiResponse);
    }
  }

  async confirmCleanup(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const data = req.body as CleanupConfirmRequest;

      const result = bookingService.confirmCleanup(id, userId, data);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: result.message,
      } as ApiResponse);
    } catch (error) {
      console.error('Confirm cleanup error:', error);
      res.status(500).json({
        success: false,
        message: '清洁确认失败',
      } as ApiResponse);
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = bookingService.cancelBooking(id, userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: result.message,
      } as ApiResponse);
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: '取消预约失败',
      } as ApiResponse);
    }
  }
}

export const bookingController = new BookingController();
