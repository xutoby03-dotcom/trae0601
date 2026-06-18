import { type Request, type Response } from 'express';
import { z } from 'zod';
import { DailyRecordService } from '../services/DailyRecordService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const recordIdSchema = z.object({
  id: z.coerce.number().int().positive('记录ID必须是正整数')
});

const stayIdSchema = z.object({
  stayId: z.coerce.number().int().positive('寄养订单ID必须是正整数')
});

const dateSchema = z.object({
  date: z.string().min(1, '日期不能为空')
});

const createRecordSchema = z.object({
  stayId: z.coerce.number().int().positive('寄养订单ID必须是正整数'),
  recordDate: z.string().min(1, '记录日期不能为空'),
  feeding: z.string().min(1, '喂食情况不能为空'),
  defecation: z.enum(['normal', 'soft', 'diarrhea', 'constipation', 'none']),
  defecationCount: z.coerce.number().int().min(0, '排便次数不能为负数').default(0),
  mentalState: z.enum(['excellent', 'good', 'fair', 'poor']),
  waterIntake: z.string().optional(),
  exercise: z.string().optional(),
  abnormal: z.boolean().default(false),
  abnormalDescription: z.string().optional(),
  abnormalPhotos: z.array(z.string()).optional(),
  handlingMeasures: z.string().optional(),
  recordedBy: z.coerce.number().int().positive('记录人ID必须是正整数')
});

const updateRecordSchema = z.object({
  recordDate: z.string().min(1).optional(),
  feeding: z.string().min(1).optional(),
  defecation: z.enum(['normal', 'soft', 'diarrhea', 'constipation', 'none']).optional(),
  defecationCount: z.coerce.number().int().min(0).optional(),
  mentalState: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  waterIntake: z.string().optional(),
  exercise: z.string().optional(),
  abnormal: z.boolean().optional(),
  abnormalDescription: z.string().optional(),
  abnormalPhotos: z.array(z.string()).optional(),
  handlingMeasures: z.string().optional(),
  recordedBy: z.coerce.number().int().positive().optional()
});

export const DailyRecordController = {
  async getByStayId(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const result = DailyRecordService.getByStayId(params.stayId);
      res.json({
        success: true,
        data: result,
        message: '获取日常记录成功'
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
        message: error instanceof Error ? error.message : '获取日常记录失败'
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const params = recordIdSchema.parse(req.params);
      const result = DailyRecordService.getById(params.id);
      res.json({
        success: true,
        data: result,
        message: '获取日常记录成功'
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
        message: error instanceof Error ? error.message : '获取日常记录失败'
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createRecordSchema.parse(req.body);
      const result = DailyRecordService.create(validated);
      res.json({
        success: true,
        data: result,
        message: '创建日常记录成功'
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
        message: error instanceof Error ? error.message : '创建日常记录失败'
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const params = recordIdSchema.parse(req.params);
      const validated = updateRecordSchema.parse(req.body);
      const result = DailyRecordService.update(params.id, validated);
      res.json({
        success: true,
        data: result,
        message: '更新日常记录成功'
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
        message: error instanceof Error ? error.message : '更新日常记录失败'
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const params = recordIdSchema.parse(req.params);
      DailyRecordService.delete(params.id);
      res.json({
        success: true,
        message: '删除日常记录成功'
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
        message: error instanceof Error ? error.message : '删除日常记录失败'
      });
    }
  },

  async getTodayRecords(req: Request, res: Response): Promise<void> {
    try {
      const result = DailyRecordService.getTodayRecords();
      res.json({
        success: true,
        data: result,
        message: '获取今日记录成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取今日记录失败'
      });
    }
  },

  async getByStayAndDate(req: Request, res: Response): Promise<void> {
    try {
      const params = stayIdSchema.parse(req.params);
      const query = dateSchema.parse(req.query);
      const result = DailyRecordService.getByStayAndDate(params.stayId, query.date);
      res.json({
        success: true,
        data: result,
        message: '获取日常记录成功'
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
        message: error instanceof Error ? error.message : '获取日常记录失败'
      });
    }
  }
};
