import { type Request, type Response } from 'express';
import { z } from 'zod';
import { DashboardService } from '../services/DashboardService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const expiringDaysSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30)
});

export const DashboardController = {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = DashboardService.getStats();
      res.json({
        success: true,
        data: result,
        message: '获取统计数据成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取统计数据失败'
      });
    }
  },

  async getExpiringVaccines(req: Request, res: Response): Promise<void> {
    try {
      const params = expiringDaysSchema.parse(req.query);
      const result = DashboardService.getExpiringVaccines(params.days);
      res.json({
        success: true,
        data: result,
        message: '获取即将到期疫苗成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取即将到期疫苗失败'
      });
    }
  },

  async getPendingMaterials(req: Request, res: Response): Promise<void> {
    try {
      const result = DashboardService.getPendingMaterials();
      res.json({
        success: true,
        data: result,
        message: '获取待处理资料成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取待处理资料失败'
      });
    }
  },

  async getHighRiskPets(req: Request, res: Response): Promise<void> {
    try {
      const result = DashboardService.getHighRiskPets();
      res.json({
        success: true,
        data: result,
        message: '获取高风险宠物成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取高风险宠物失败'
      });
    }
  },

  async getDailySummary(req: Request, res: Response): Promise<void> {
    try {
      const result = DashboardService.getDailySummary();
      res.json({
        success: true,
        data: result,
        message: '获取每日汇总成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取每日汇总失败'
      });
    }
  }
};
