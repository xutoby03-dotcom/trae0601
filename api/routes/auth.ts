import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import { User } from '../../shared/types.js';

const router = Router();

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: '用户名和密码不能为空'
      });
      return;
    }

    const userWithPassword = UserRepository.findByUsername(username);
    if (!userWithPassword) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
      return;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
      return;
    }

    const token = jwt.sign(
      { userId: userWithPassword.id, role: userWithPassword.role },
      process.env.JWT_SECRET || 'pet-boarding-secret-key',
      { expiresIn: '24h' }
    );

    const { passwordHash, ...user } = userWithPassword;

    res.status(200).json({
      success: true,
      data: {
        user,
        token
      } as LoginResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试'
    });
  }
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: '登出失败'
    });
  }
});

export default router;
