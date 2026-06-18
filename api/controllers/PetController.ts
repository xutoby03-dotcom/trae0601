import { type Request, type Response } from 'express';
import { z } from 'zod';
import { PetService } from '../services/PetService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const petIdSchema = z.object({
  id: z.coerce.number().int().positive('宠物ID必须是正整数')
});

const petListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  keyword: z.string().optional(),
  species: z.enum(['all', 'dog', 'cat', 'other']).optional()
});

const createPetSchema = z.object({
  name: z.string().min(1, '宠物名称不能为空'),
  species: z.enum(['dog', 'cat', 'other']),
  breed: z.string().min(1, '品种不能为空'),
  age: z.coerce.number().int().min(0, '年龄不能为负数'),
  weight: z.coerce.number().positive('体重必须为正数'),
  personality: z.string().default(''),
  sterilized: z.boolean().default(false),
  ownerName: z.string().min(1, '主人姓名不能为空'),
  ownerPhone: z.string().min(1, '主人电话不能为空'),
  photoUrl: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  specialRequirements: z.string().optional()
});

const updatePetSchema = createPetSchema.partial();

const searchSchema = z.object({
  keyword: z.string().min(1, '搜索关键词不能为空')
});

export const PetController = {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const params = petListSchema.parse(req.query);
      const result = PetService.list(params);
      res.json({
        success: true,
        data: result,
        message: '获取宠物列表成功'
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
        message: error instanceof Error ? error.message : '获取宠物列表失败'
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const params = petIdSchema.parse(req.params);
      const result = PetService.getById(params.id);
      res.json({
        success: true,
        data: result,
        message: '获取宠物信息成功'
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
        message: error instanceof Error ? error.message : '获取宠物信息失败'
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createPetSchema.parse(req.body);
      const result = PetService.create(validated);
      res.json({
        success: true,
        data: result,
        message: '创建宠物档案成功'
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
        message: error instanceof Error ? error.message : '创建宠物档案失败'
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const params = petIdSchema.parse(req.params);
      const validated = updatePetSchema.parse(req.body);
      const result = PetService.update(params.id, validated);
      res.json({
        success: true,
        data: result,
        message: '更新宠物档案成功'
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
        message: error instanceof Error ? error.message : '更新宠物档案失败'
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const params = petIdSchema.parse(req.params);
      PetService.delete(params.id);
      res.json({
        success: true,
        message: '删除宠物档案成功'
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
        message: error instanceof Error ? error.message : '删除宠物档案失败'
      });
    }
  },

  async search(req: Request, res: Response): Promise<void> {
    try {
      const params = searchSchema.parse(req.query);
      const result = PetService.search(params.keyword);
      res.json({
        success: true,
        data: result,
        message: '搜索成功'
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
        message: error instanceof Error ? error.message : '搜索失败'
      });
    }
  }
};
