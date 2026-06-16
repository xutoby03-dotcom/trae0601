import { Request, Response } from 'express';
import { adminService } from '../services/AdminService';
import { ApiResponse } from '../../shared/types';

export class AdminController {
  async getUsageStats(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const stats = adminService.getUsageStats(days);

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error) {
      console.error('Get usage stats error:', error);
      res.status(500).json({
        success: false,
        message: '获取使用率统计失败',
      } as ApiResponse);
    }
  }

  async getPopularTimes(req: Request, res: Response) {
    try {
      const times = adminService.getPopularTimes();

      res.json({
        success: true,
        data: times,
      } as ApiResponse);
    } catch (error) {
      console.error('Get popular times error:', error);
      res.status(500).json({
        success: false,
        message: '获取热门时段失败',
      } as ApiResponse);
    }
  }

  async getNoShowList(req: Request, res: Response) {
    try {
      const list = adminService.getNoShowList();

      res.json({
        success: true,
        data: list,
      } as ApiResponse);
    } catch (error) {
      console.error('Get no show list error:', error);
      res.status(500).json({
        success: false,
        message: '获取爽约名单失败',
      } as ApiResponse);
    }
  }

  async getDamagePartStats(req: Request, res: Response) {
    try {
      const stats = adminService.getDamagePartStats();

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error) {
      console.error('Get damage stats error:', error);
      res.status(500).json({
        success: false,
        message: '获取易损部件统计失败',
      } as ApiResponse);
    }
  }

  async getTodaySummary(req: Request, res: Response) {
    try {
      const summary = adminService.getTodaySummary();

      res.json({
        success: true,
        data: summary,
      } as ApiResponse);
    } catch (error) {
      console.error('Get today summary error:', error);
      res.status(500).json({
        success: false,
        message: '获取今日概览失败',
      } as ApiResponse);
    }
  }
}

export const adminController = new AdminController();
