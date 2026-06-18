import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import type { User } from '../../shared/types.js';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const AuthService = {
  async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    const userWithPassword = UserRepository.findByUsername(username);
    if (!userWithPassword) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isValid) {
      throw new Error('用户名或密码错误');
    }

    const secret = process.env.JWT_SECRET || 'pet-boarding-secret';
    const token = jwt.sign(
      { id: userWithPassword.id, username: userWithPassword.username, role: userWithPassword.role },
      secret,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...user } = userWithPassword;
    return { user, token };
  },

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<User> {
    const userWithPassword = UserRepository.findByUsername(
      UserRepository.findById(userId)?.username || ''
    );
    if (!userWithPassword) {
      throw new Error('用户不存在');
    }

    const isValid = await bcrypt.compare(oldPassword, userWithPassword.passwordHash);
    if (!isValid) {
      throw new Error('原密码错误');
    }

    if (newPassword.length < 6) {
      throw new Error('新密码长度至少6位');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = UserRepository.update(userId, { passwordHash });
    if (!updatedUser) {
      throw new Error('更新密码失败');
    }

    return updatedUser;
  },

  getCurrentUser(userId: number): User {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }
};
