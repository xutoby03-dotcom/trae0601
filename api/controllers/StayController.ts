import { type Request, type Response } from 'express';
import { z } from 'zod';
import { StayService } from '../services/StayService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const stayIdSchema = z.object({
  id: z.coerce.number().int().positive('订单ID必须是正整数')
});

const petIdSchema = z.object({
  petId: z.coerce.number().int().positive('宠物ID必须是正整数')
});

const stayListSchema = z.object({
  status: z.enum(['all', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
});

const createStaySchema = z.object({
  petId: z.coerce.number().int().positive('宠物ID必须是正整数'),
  checkInDate: z.string().min(1, '入住日期不能为空'),
  checkOutDate: z.string().min(1, '退房日期不能为空'),
  cageId: z.coerce.number().int().positive().optional(),
  requiresIsolation: z.boolean().optional(),
  notes: z.string().optional()
});

const updateStaySchema = z.object({
  petId: z.coerce.number().int().positive().optional(),
  cageId: z.coerce.number().int().positive().optional(),
  checkInDate: z.string().min(1).optional(),
  checkOutDate: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']).optional(),
  vaccinationVerified: z.boolean().optional(),
  requiresIsolation: z.boolean().optional(),
  highRisk: z.boolean().optional(),
  highRiskReason: z.string().optional(),
  assignedStaffId: z.coerce.number().int().positive().optional(),
  notes: z.string().optional()
});

const checkInSchema = z.object({
  cageId: z.coerce.number().int().positive('笼位ID必须是正整数'),
  assignedStaffId: z.coerce.number().int().positive().optional()
});

const checkOutSchema = z.object({
  notes: z.string().optional()
});

export const StayController = {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const params = stayListSchema.parse(req.query);
      const result = StayService.list(params);
      res.json({
        success: true,
        data: result,
        message: '获取寄养订单列表成功'
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
        message: error instanceof Error ? error.message : '获取寄养订单列表失败'
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const result = StayService.getById(params.id);
      res.json({
        success: true,
        data: result,
        message: '获取寄养订单成功'
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
        message: error instanceof Error ? error.message : '获取寄养订单失败'
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createStaySchema.parse(req.body);
      const result = await StayService.create(validated);
      res.json({
        success: true,
        data: result,
        message: '创建寄养订单成功'
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
        message: error instanceof Error ? error.message : '创建寄养订单失败'
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const validated = updateStaySchema.parse(req.body);
      const result = StayService.update(params.id, validated);
      res.json({
        success: true,
        data: result,
        message: '更新寄养订单成功'
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
        message: error instanceof Error ? error.message : '更新寄养订单失败'
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      StayService.delete(params.id);
      res.json({
        success: true,
        message: '删除寄养订单成功'
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
        message: error instanceof Error ? error.message : '删除寄养订单失败'
      });
    }
  },

  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const validated = checkInSchema.parse(req.body);
      const result = StayService.checkIn({
        stayId: params.id,
        cageId: validated.cageId,
        assignedStaffId: validated.assignedStaffId
      });
      res.json({
        success: true,
        data: result,
        message: '办理入住成功'
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
        message: error instanceof Error ? error.message : '办理入住失败'
      });
    }
  },

  async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const validated = checkOutSchema.parse(req.body);
      const result = StayService.checkOut({
        stayId: params.id,
        notes: validated.notes
      });
      res.json({
        success: true,
        data: result,
        message: '办理退房成功'
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
        message: error instanceof Error ? error.message : '办理退房失败'
      });
    }
  },

  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const result = StayService.confirm(params.id);
      res.json({
        success: true,
        data: result,
        message: '确认订单成功'
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
        message: error instanceof Error ? error.message : '确认订单失败'
      });
    }
  },

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const result = StayService.cancel(params.id);
      res.json({
        success: true,
        data: result,
        message: '取消订单成功'
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
        message: error instanceof Error ? error.message : '取消订单失败'
      });
    }
  },

  async getByPetId(req: Request, res: Response): Promise<void> {
    try {
      const params = petIdSchema.parse(req.params);
      const result = StayService.getByPetId(params.petId);
      res.json({
        success: true,
        data: result,
        message: '获取宠物寄养记录成功'
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
        message: error instanceof Error ? error.message : '获取宠物寄养记录失败'
      });
    }
  }
};
