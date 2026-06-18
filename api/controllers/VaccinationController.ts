import { type Request, type Response } from 'express';
import { z } from 'zod';
import { VaccinationService } from '../services/VaccinationService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const vaccineIdSchema = z.object({
  id: z.coerce.number().int().positive('疫苗记录ID必须是正整数')
});

const petIdSchema = z.object({
  petId: z.coerce.number().int().positive('宠物ID必须是正整数')
});

const createVaccineSchema = z.object({
  petId: z.coerce.number().int().positive('宠物ID必须是正整数'),
  type: z.enum(['rabies', 'cat-triple', 'dog-quad', 'deworming', 'other']),
  name: z.string().min(1, '疫苗名称不能为空'),
  vaccinationDate: z.string().min(1, '接种日期不能为空'),
  expiryDate: z.string().optional(),
  certificateUrl: z.string().optional(),
  status: z.enum(['valid', 'expiring', 'expired']).optional(),
  notes: z.string().optional()
});

const updateVaccineSchema = z.object({
  type: z.enum(['rabies', 'cat-triple', 'dog-quad', 'deworming', 'other']).optional(),
  name: z.string().min(1).optional(),
  vaccinationDate: z.string().min(1).optional(),
  expiryDate: z.string().optional(),
  certificateUrl: z.string().optional(),
  status: z.enum(['valid', 'expiring', 'expired']).optional(),
  notes: z.string().optional()
});

const verifySchema = z.object({
  verifiedBy: z.coerce.number().int().positive('核验人ID必须是正整数'),
  notes: z.string().optional()
});

const expiringSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30)
});

export const VaccinationController = {
  async getByPetId(req: Request, res: Response): Promise<void> {
    try {
      const params = petIdSchema.parse(req.params);
      const result = VaccinationService.getByPetId(params.petId);
      res.json({
        success: true,
        data: result,
        message: '获取疫苗记录成功'
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
        message: error instanceof Error ? error.message : '获取疫苗记录失败'
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const params = vaccineIdSchema.parse(req.params);
      const result = VaccinationService.getById(params.id);
      res.json({
        success: true,
        data: result,
        message: '获取疫苗记录成功'
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
        message: error instanceof Error ? error.message : '获取疫苗记录失败'
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createVaccineSchema.parse(req.body);
      const result = VaccinationService.create(validated);
      res.json({
        success: true,
        data: result,
        message: '创建疫苗记录成功'
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
        message: error instanceof Error ? error.message : '创建疫苗记录失败'
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const params = vaccineIdSchema.parse(req.params);
      const validated = updateVaccineSchema.parse(req.body);
      const result = VaccinationService.update(params.id, validated);
      res.json({
        success: true,
        data: result,
        message: '更新疫苗记录成功'
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
        message: error instanceof Error ? error.message : '更新疫苗记录失败'
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const params = vaccineIdSchema.parse(req.params);
      VaccinationService.delete(params.id);
      res.json({
        success: true,
        message: '删除疫苗记录成功'
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
        message: error instanceof Error ? error.message : '删除疫苗记录失败'
      });
    }
  },

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const params = vaccineIdSchema.parse(req.params);
      const validated = verifySchema.parse(req.body);
      const result = VaccinationService.verify(params.id, validated.verifiedBy, validated.notes);
      res.json({
        success: true,
        data: result,
        message: '疫苗核验成功'
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
        message: error instanceof Error ? error.message : '疫苗核验失败'
      });
    }
  },

  async checkPetVaccinations(req: Request, res: Response): Promise<void> {
    try {
      const params = petIdSchema.parse(req.params);
      const result = VaccinationService.checkPetVaccinations(params.petId);
      res.json({
        success: true,
        data: result,
        message: '疫苗核验完成'
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
        message: error instanceof Error ? error.message : '疫苗核验失败'
      });
    }
  },

  async getExpiring(req: Request, res: Response): Promise<void> {
    try {
      const params = expiringSchema.parse(req.query);
      const result = VaccinationService.getExpiring(params.days);
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
  }
};
