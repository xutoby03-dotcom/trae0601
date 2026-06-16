import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { ApiResponse } from '../../shared/types';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { employeeId } = req.body;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: '请输入工号',
        } as ApiResponse);
      }

      const result = authService.login(employeeId);
      
      if (!result) {
        return res.status(401).json({
          success: false,
          message: '工号不存在',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: '登录失败',
      } as ApiResponse);
    }
  }

  async me(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: req.user,
      } as ApiResponse);
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败',
      } as ApiResponse);
    }
  }
}

export const authController = new AuthController();
