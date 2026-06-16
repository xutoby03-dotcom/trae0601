import { db } from '../db/connection';
import { User } from '../../shared/types';

function mapRow(row: any): User {
  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.name,
    role: row.role,
    creditScore: row.credit_score,
    createdAt: row.created_at,
  };
}

export class UserRepository {
  findByEmployeeId(employeeId: string): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE employee_id = ?').get(employeeId) as any | undefined;
    return row ? mapRow(row) : undefined;
  }

  findById(id: number): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any | undefined;
    return row ? mapRow(row) : undefined;
  }

  updateCreditScore(userId: number, score: number): void {
    db.prepare('UPDATE users SET credit_score = ? WHERE id = ?').run(score, userId);
  }

  deductCreditScore(userId: number, points: number): void {
    db.prepare('UPDATE users SET credit_score = credit_score - ? WHERE id = ?').run(points, userId);
  }
}

export const userRepository = new UserRepository();
