import db from '../db/database.js';
import { Cage } from '../../shared/types.js';

function rowToCage(row: any): Cage {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    suitableFor: row.suitable_for,
    size: row.size,
    status: row.status,
    currentStayId: row.current_stay_id,
    notes: row.notes
  };
}

export const CageRepository = {
  findAll(type?: string, status?: string, suitableFor?: string): Cage[] {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (type && type !== 'all') {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (suitableFor && suitableFor !== 'all') {
      whereClause += ' AND suitable_for IN (?, ?)';
      params.push(suitableFor, 'both');
    }
    
    const rows = db.prepare(`
      SELECT * FROM cages ${whereClause}
      ORDER BY type DESC, code ASC
    `).all(...params);
    
    return rows.map(rowToCage);
  },

  findAvailable(checkInDate: string, checkOutDate: string, suitableFor?: string): Cage[] {
    let whereClause = `
      WHERE status = 'available' 
        AND id NOT IN (
          SELECT cage_id FROM stays 
          WHERE status IN ('confirmed', 'checked-in')
            AND cage_id IS NOT NULL
            AND check_in_date <= ?
            AND (check_out_date IS NULL OR check_out_date >= ?)
        )
    `;
    const params: any[] = [checkOutDate, checkInDate];
    
    if (suitableFor && suitableFor !== 'all') {
      whereClause += ' AND suitable_for IN (?, ?)';
      params.push(suitableFor, 'both');
    }
    
    const rows = db.prepare(`
      SELECT * FROM cages ${whereClause}
      ORDER BY type DESC, code ASC
    `).all(...params);
    
    return rows.map(rowToCage);
  },

  findById(id: number): Cage | undefined {
    const row = db.prepare('SELECT * FROM cages WHERE id = ?').get(id);
    return row ? rowToCage(row) : undefined;
  },

  findByCode(code: string): Cage | undefined {
    const row = db.prepare('SELECT * FROM cages WHERE code = ?').get(code);
    return row ? rowToCage(row) : undefined;
  },

  create(cage: Omit<Cage, 'id'>): Cage {
    const stmt = db.prepare(`
      INSERT INTO cages (code, name, type, suitable_for, size, status, current_stay_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      cage.code, cage.name, cage.type, cage.suitableFor, cage.size,
      cage.status, cage.currentStayId, cage.notes
    );
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<Cage, 'id'>>): Cage | undefined {
    const fields = [];
    const values: any[] = [];
    
    if (updates.code !== undefined) { fields.push('code = ?'); values.push(updates.code); }
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
    if (updates.suitableFor !== undefined) { fields.push('suitable_for = ?'); values.push(updates.suitableFor); }
    if (updates.size !== undefined) { fields.push('size = ?'); values.push(updates.size); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.currentStayId !== undefined) { fields.push('current_stay_id = ?'); values.push(updates.currentStayId); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    db.prepare(`UPDATE cages SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  setOccupied(cageId: number, stayId: number): boolean {
    const result = db.prepare(`
      UPDATE cages SET status = 'occupied', current_stay_id = ? WHERE id = ?
    `).run(stayId, cageId);
    return result.changes > 0;
  },

  setAvailable(cageId: number): boolean {
    const result = db.prepare(`
      UPDATE cages SET status = 'available', current_stay_id = NULL WHERE id = ?
    `).run(cageId);
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM cages WHERE id = ?').run(id);
    return result.changes > 0;
  }
};
