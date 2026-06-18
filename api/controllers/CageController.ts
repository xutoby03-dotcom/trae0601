import { type Request, type Response } from 'express';
import { z } from 'zod';
import { CageService } from '../services/CageService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const cageIdSchema = z.object({
  id: z.coerce.number().int().positive('笼位ID必须是正整数')
});

const cageCodeSchema = z.object({
  code: z.string().min(1, '笼位编号不能为空')
});

const cageListSchema = z.object({
  type: z.enum(['all', 'normal', 'isolation']).optional(),
  status: z.enum(['all', 'available', 'occupied', 'maintenance']).optional(),
  suitableFor: z.enum(['all', 'dog', 'cat', 'both']).optional()
});

const availableCageSchema = z.object({
  checkInDate: z.string().min(1, '入住日期不能为空'),
  checkOutDate: z.string().min(1, '退房日期不能为空'),
  suitableFor: z.enum(['all', 'dog', 'cat', 'both']).optional()
});

const createCageSchema = z.object({
  code: z.string().min(1, '笼位编号不能为空'),
  name: z.string().min(1, '笼位名称不能为空'),
  type: z.enum(['normal', 'isolation']),
  suitableFor: z.enum(['dog', 'cat', 'both']),
  size: z.enum(['small', 'medium', 'large']),
  status: z.enum(['available', 'occupied', 'maintenance']).default('available'),
  currentStayId: z.coerce.number().int().positive().optional(),
  notes: z.string().optional()
});

const updateCageSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.enum(['normal', 'isolation']).optional(),
  suitableFor: z.enum(['dog', 'cat', 'both']).optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
  currentStayId: z.coerce.number().int().positive().optional(),
  notes: z.string().optional()
});

const maintenanceSchema = z.object({
  notes: z.string().optional()
});

export const CageController = {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const params = cageListSchema.parse(req.query);
      const result = CageService.list(params);
      res.json({
        success: true,
        data: result,
        message: '获取笼位列表成功'
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
        message: error instanceof Error ? error.message : '获取笼位列表失败'
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const params = cageIdSchema.parse(req.params);
      const result = CageService.getById(params.id);
      res.json({
        success: true,
        data: result,
        message: '获取笼位信息成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : '获取笼位信息失败'
      });
    }
  },

  async getByCode(req: Request, res: Response): Promise<void> {
    try {
      const params = cageCodeSchema.parse(req.params);
      const result = CageService.getByCode(params.code);
      res.json({
        success: true,
        data: result,
        message: '获取笼位信息成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : '获取笼位信息失败'
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createCageSchema.parse(req.body);
      const result = CageService.create(validated);
      res.json({
        success: true,
        data: result,
        message: '创建笼位成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '创建笼位失败'
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const params = cageIdSchema.parse(req.params);
      const validated = updateCageSchema.parse(req.body);
      const result = CageService.update(params.id, validated);
      res.json({
        success: true,
        data: result,
        message: '更新笼位成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '更新笼位失败'
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const params = cageIdSchema.parse(req.params);
      CageService.delete(params.id);
      res.json({
        success: true,
        message: '删除笼位成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '删除笼位失败'
      });
    }
  },

  async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      const params = availableCageSchema.parse(req.query);
      const result = CageService.getAvailable(params);
      res.json({
        success: true,
        data: result,
        message: '获取可用笼位成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '获取可用笼位失败'
      });
    }
  },

  async setMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const params = cageIdSchema.parse(req.params);
      const validated = maintenanceSchema.parse(req.body);
      const result = CageService.setMaintenance(params.id, validated.notes);
      res.json({
        success: true,
        data: result,
        message: '设置维护成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '设置维护失败'
      });
    }
  },

  async setAvailable(req: Request, res: Response): Promise<void> {
    try {
      const params = cageIdSchema.parse(req.params);
      const result = CageService.setAvailable(params.id);
      res.json({
        success: true,
        data: result,
        message: '设置可用成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '设置可用失败'
      });
    }
  }
};
