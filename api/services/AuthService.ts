import { userRepository } from '../repositories/UserRepository';
import { LoginResponse } from '../../shared/types';

export class AuthService {
  login(employeeId: string): LoginResponse | null {
    const user = userRepository.findByEmployeeId(employeeId.toUpperCase());
    if (!user) return null;

    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
    return { user, token };
  }
}

export const authService = new AuthService();
