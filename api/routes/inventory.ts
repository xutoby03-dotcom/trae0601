import { Router, type Request, type Response } from 'express';
import {
  InventoryItem,
  ScrapRecord,
  StockLog,
  ApiResponse,
} from '@shared/types';
import {
  mockInventory,
  mockScrapRecords,
  mockStockLogs,
} from '../data/mockData.js';

const router = Router();

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const now = () => new Date().toISOString();

router.get('/', (req: Request, res: Response): void => {
  try {
    const response: ApiResponse<InventoryItem[]> = {
      success: true,
      data: [...mockInventory],
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.post('/:id/stock-in', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { quantity, operator, batch } = req.body as {
      quantity: number;
      operator: string;
      batch?: string;
    };

    const itemIndex = mockInventory.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '库存项目不存在',
      };
      res.status(404).json(response);
      return;
    }

    const nowTime = now();
    mockInventory[itemIndex].currentStock += quantity;
    mockInventory[itemIndex].lastStockInDate = nowTime;

    const stockLog: StockLog = {
      id: generateId(),
      itemId: id,
      type: 'in',
      quantity,
      operator,
      relatedId: batch,
      createdAt: nowTime,
    };
    mockStockLogs.push(stockLog);

    const response: ApiResponse<InventoryItem> = {
      success: true,
      data: mockInventory[itemIndex],
      message: `入库成功，增加${quantity}${mockInventory[itemIndex].unit}`,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.post('/:id/stock-out', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { quantity, operator, usageId } = req.body as {
      quantity: number;
      operator: string;
      usageId?: string;
    };

    const itemIndex = mockInventory.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '库存项目不存在',
      };
      res.status(404).json(response);
      return;
    }

    if (mockInventory[itemIndex].currentStock < quantity) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '库存不足',
      };
      res.status(400).json(response);
      return;
    }

    const nowTime = now();
    mockInventory[itemIndex].currentStock -= quantity;

    const stockLog: StockLog = {
      id: generateId(),
      itemId: id,
      type: 'out',
      quantity,
      operator,
      relatedId: usageId,
      createdAt: nowTime,
    };
    mockStockLogs.push(stockLog);

    const response: ApiResponse<InventoryItem> = {
      success: true,
      data: mockInventory[itemIndex],
      message: `出库成功，减少${quantity}${mockInventory[itemIndex].unit}`,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.get('/scrap', (req: Request, res: Response): void => {
  try {
    const { type, date, page = '1', pageSize = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 20;

    let filtered = [...mockScrapRecords];

    if (type) {
      filtered = filtered.filter((s) => s.type === type);
    }
    if (date) {
      const dateStr = date as string;
      filtered = filtered.filter((s) => s.createdAt.startsWith(dateStr));
    }

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filtered.length;
    const start = (pageNum - 1) * pageSizeNum;
    const data = filtered.slice(start, start + pageSizeNum);

    const response: ApiResponse<ScrapRecord[]> = {
      success: true,
      data,
      total,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.post('/scrap', (req: Request, res: Response): void => {
  try {
    const body = req.body as Partial<ScrapRecord>;
    const nowTime = now();
    const newScrap: ScrapRecord = {
      id: generateId(),
      itemId: body.itemId,
      itemName: body.itemName || '',
      type: body.type || '',
      quantity: body.quantity || 1,
      reason: body.reason!,
      relatedDeviceId: body.relatedDeviceId,
      relatedDeviceCode: body.relatedDeviceCode,
      operator: body.operator || '',
      remark: body.remark,
      createdAt: nowTime,
    };
    mockScrapRecords.push(newScrap);

    if (body.itemId && body.quantity) {
      const itemIndex = mockInventory.findIndex((i) => i.id === body.itemId);
      if (itemIndex !== -1) {
        mockInventory[itemIndex].currentStock = Math.max(
          0,
          mockInventory[itemIndex].currentStock - body.quantity
        );
      }
    }

    const response: ApiResponse<ScrapRecord> = {
      success: true,
      data: newScrap,
      message: '报废记录创建成功',
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.get('/stock-logs', (req: Request, res: Response): void => {
  try {
    const sorted = [...mockStockLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const response: ApiResponse<StockLog[]> = {
      success: true,
      data: sorted,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

export default router;
