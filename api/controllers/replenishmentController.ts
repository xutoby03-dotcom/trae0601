import type { Request, Response } from 'express';
import * as replenishmentService from '../services/replenishmentService';
import type { CreateReplenishmentRequest, ApiResponse } from '../../shared/types';

export async function getReplenishments(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { printerId, supplier } = req.query;
    const replenishments = replenishmentService.getAllReplenishments(
      printerId as string | undefined,
      supplier as string | undefined
    );
    res.json({ success: true, data: replenishments });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取补货记录失败' });
  }
}

export async function getReplenishment(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { id } = req.params;
    const replenishment = replenishmentService.getReplenishmentById(id);
    
    if (!replenishment) {
      return res.status(404).json({ success: false, message: '补货记录不存在' });
    }
    
    res.json({ success: true, data: replenishment });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取补货记录详情失败' });
  }
}

export async function createReplenishment(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const data: CreateReplenishmentRequest = req.body;
    
    if (!data.printerId || !data.supplier || !data.boxCount || !data.unitPrice) {
      return res.status(400).json({ success: false, message: '缺少必要字段' });
    }
    
    if (data.boxCount <= 0 || data.unitPrice <= 0) {
      return res.status(400).json({ success: false, message: '箱数和单价必须大于0' });
    }
    
    const replenishment = replenishmentService.createReplenishment(data);
    res.status(201).json({ success: true, data: replenishment });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建补货记录失败' });
  }
}
