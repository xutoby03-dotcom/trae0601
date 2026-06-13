import type { Request, Response } from 'express';
import * as printerService from '../services/printerService';
import type { CreatePrinterRequest, ApiResponse } from '../../shared/types';

export async function getPrinters(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const printers = printerService.getAllPrinters();
    res.json({ success: true, data: printers });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取打印点列表失败' });
  }
}

export async function getPrinter(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { id } = req.params;
    const printer = printerService.getPrinterById(id);
    
    if (!printer) {
      return res.status(404).json({ success: false, message: '打印点不存在' });
    }
    
    res.json({ success: true, data: printer });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取打印点详情失败' });
  }
}

export async function createPrinter(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const data: CreatePrinterRequest = req.body;
    
    if (!data.location || !data.printerModel || !data.paperSpec || !data.manager) {
      return res.status(400).json({ success: false, message: '缺少必要字段' });
    }
    
    const printer = printerService.createPrinter(data);
    res.status(201).json({ success: true, data: printer });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建打印点失败' });
  }
}

export async function updatePrinter(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { id } = req.params;
    const data: Partial<CreatePrinterRequest> = req.body;
    
    const printer = printerService.updatePrinter(id, data);
    
    if (!printer) {
      return res.status(404).json({ success: false, message: '打印点不存在' });
    }
    
    res.json({ success: true, data: printer });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新打印点失败' });
  }
}

export async function deletePrinter(req: Request, res: Response<ApiResponse<any>>) {
  try {
    const { id } = req.params;
    
    const success = printerService.deletePrinter(id);
    
    if (!success) {
      return res.status(404).json({ success: false, message: '打印点不存在' });
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除打印点失败' });
  }
}
