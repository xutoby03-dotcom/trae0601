import { type Request, type Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService.js';

function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || '参数验证失败';
}

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空')
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '原密码不能为空'),
  newPassword: z.string().min(6, '新密码长度至少6位')
});

const userIdSchema = z.object({
  userId: z.coerce.number().int().positive('用户ID必须是正整数')
});

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      res.json({
        success: true,
        data: result,
        message: '登录成功'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: getZodErrorMessage(error)
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : '登录失败'
      });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        message: '退出登录成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '退出登录失败'
      });
    }
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdSchema.parse(req.params);
      const validated = changePasswordSchema.parse(req.body);
      const result = await AuthService.changePassword(
        params.userId,
        validated.oldPassword,
        validated.newPassword
      );
      res.json({
        success: true,
        data: result,
        message: '密码修改成功'
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
        message: error instanceof Error ? error.message : '密码修改失败'
      });
    }
  },

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdSchema.parse(req.params);
      const result = AuthService.getCurrentUser(params.userId);
      res.json({
        success: true,
        data: result,
        message: '获取用户信息成功'
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
        message: error instanceof Error ? error.message : '获取用户信息失败'
      });
    }
  }
};
