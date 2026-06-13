import type { Request, Response } from 'express';
import * as statisticsService from '../services/statisticsService';
import type { ApiResponse } from '../../shared/types';

export async function getConsumptionRate(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const data = statisticsService.getConsumptionRate();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取消耗速度统计失败' });
  }
}

export async function getDepartmentUsage(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const data = statisticsService.getDepartmentUsage();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取部门用量统计失败' });
  }
}

export async function getReplenishmentForecast(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const data = statisticsService.getReplenishmentForecast();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取补货预测失败' });
  }
}

export async function getDailyTrend(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { days } = req.query;
    const daysNum = days ? parseInt(days as string, 10) : 30;
    const data = statisticsService.getDailyConsumptionTrend(daysNum);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取日消耗趋势失败' });
  }
}
