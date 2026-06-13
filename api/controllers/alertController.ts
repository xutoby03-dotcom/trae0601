import type { Request, Response } from 'express';
import * as alertService from '../services/alertService';
import type { ApiResponse } from '../../shared/types';

export async function getAlerts(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { printerId, isResolved } = req.query;
    const alerts = alertService.getAllAlerts(
      printerId as string | undefined,
      isResolved !== undefined ? isResolved === 'true' : undefined
    );
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取预警列表失败' });
  }
}

export async function resolveAlert(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { id } = req.params;
    const alert = alertService.resolveAlert(id);
    
    if (!alert) {
      return res.status(404).json({ success: false, message: '预警不存在' });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: '处理预警失败' });
  }
}
