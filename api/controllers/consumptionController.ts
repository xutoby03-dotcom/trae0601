import type { Request, Response } from 'express';
import * as consumptionService from '../services/consumptionService';
import type { CreateConsumptionRequest, ApiResponse } from '../../shared/types';

export async function getConsumptions(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { printerId, department } = req.query;
    const consumptions = consumptionService.getAllConsumptions(
      printerId as string | undefined,
      department as string | undefined
    );
    res.json({ success: true, data: consumptions });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取领用记录失败' });
  }
}

export async function getConsumption(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { id } = req.params;
    const consumption = consumptionService.getConsumptionById(id);
    
    if (!consumption) {
      return res.status(404).json({ success: false, message: '领用记录不存在' });
    }
    
    res.json({ success: true, data: consumption });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取领用记录详情失败' });
  }
}

export async function createConsumption(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const data: CreateConsumptionRequest = req.body;
    
    if (!data.printerId || !data.department || !data.quantity || !data.purpose || !data.receiver) {
      return res.status(400).json({ success: false, message: '缺少必要字段' });
    }
    
    if (data.quantity <= 0) {
      return res.status(400).json({ success: false, message: '领用数量必须大于0' });
    }
    
    const consumption = consumptionService.createConsumption(data);
    res.status(201).json({ success: true, data: consumption });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建领用记录失败' });
  }
}
