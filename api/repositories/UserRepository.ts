import db from '../db/database.js';
import { User } from '../../shared/types.js';

export interface UserWithPassword extends User {
  passwordHash: string;
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    phone: row.phone,
    active: row.active === 1,
    createdAt: row.created_at
  };
}

export const UserRepository = {
  findAll(): User[] {
    const rows = db.prepare('SELECT * FROM users WHERE active = 1 ORDER BY id').all();
    return rows.map(rowToUser);
  },

  findById(id: number): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? rowToUser(row) : undefined;
  },

  findByUsername(username: string): UserWithPassword | undefined {
    const row = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username) as any;
    if (!row) return undefined;
    return {
      ...rowToUser(row),
      passwordHash: row.password_hash
    };
  },

  create(user: Omit<User, 'id' | 'createdAt' | 'active'> & { passwordHash: string }): User {
    const stmt = db.prepare(`
      INSERT INTO users (username, name, role, phone, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(user.username, user.name, user.role, user.phone, user.passwordHash);
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>> & { passwordHash?: string }): User | undefined {
    const fields = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.role !== undefined) { fields.push('role = ?'); values.push(updates.role); }
    if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.active !== undefined) { fields.push('active = ?'); values.push(updates.active ? 1 : 0); }
    if (updates.passwordHash !== undefined) { fields.push('password_hash = ?'); values.push(updates.passwordHash); }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(id);
    return result.changes > 0;
  }
};
