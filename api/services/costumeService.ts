import { db } from '../db/init';
import type { Costume, AccessoryItem } from '../../shared/types';

export interface CostumeQuery {
  status?: string;
  wash_status?: string;
  size?: string;
  program?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function getCostumes(query: CostumeQuery = {}) {
  const { status, wash_status, size, program, search, page = 1, pageSize = 20 } = query;

  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (status) {
    conditions.push('c.status = @status');
    params.status = status;
  }
  if (wash_status) {
    conditions.push('c.wash_status = @wash_status');
    params.wash_status = wash_status;
  }
  if (size) {
    conditions.push('c.size = @size');
    params.size = size;
  }
  if (program) {
    conditions.push('c.program = @program');
    params.program = program;
  }
  if (search) {
    conditions.push('(c.name LIKE @search OR c.id LIKE @search OR c.program LIKE @search)');
    params.search = `%${search}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countStmt = db.prepare(`
    SELECT COUNT(*) as total FROM costumes c ${whereClause}
  `);
  const { total } = countStmt.get(params) as { total: number };

  const offset = (page - 1) * pageSize;
  const rowsStmt = db.prepare(`
    SELECT c.* FROM costumes c ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT @pageSize OFFSET @offset
  `);

  const costumes = rowsStmt.all({ ...params, pageSize, offset }) as Costume[];

  const costumeIds = costumes.map((c) => c.id);
  if (costumeIds.length > 0) {
    const placeholders = costumeIds.map((_, i) => `?`).join(',');
    const accStmt = db.prepare(`
      SELECT * FROM accessory_items WHERE costume_id IN (${placeholders})
    `);
    const accessories = accStmt.all(...costumeIds) as AccessoryItem[];

    for (const costume of costumes) {
      costume.accessories = accessories.filter((a) => a.costume_id === costume.id);
    }
  }

  return {
    list: costumes,
    total,
    page,
    pageSize,
  };
}

export function getCostumeById(id: string): Costume | null {
  const costume = db.prepare('SELECT * FROM costumes WHERE id = ?').get(id) as Costume | undefined;
  if (!costume) return null;

  const accessories = db
    .prepare('SELECT * FROM accessory_items WHERE costume_id = ? ORDER BY category, name')
    .all(id) as AccessoryItem[];

  costume.accessories = accessories;
  return costume;
}

export function createCostume(costume: Omit<Costume, 'created_at' | 'updated_at'> & { accessories?: Omit<AccessoryItem, 'id' | 'costume_id'>[] }) {
  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO costumes (id, name, size, program, photo_url, wash_status, status, use_count, notes)
      VALUES (@id, @name, @size, @program, @photo_url, @wash_status, @status, @use_count, @notes)
    `).run({
      id: costume.id,
      name: costume.name,
      size: costume.size,
      program: costume.program || '',
      photo_url: costume.photo_url || '',
      wash_status: costume.wash_status || 'clean',
      status: costume.status || 'available',
      use_count: costume.use_count || 0,
      notes: costume.notes || null,
    });

    if (costume.accessories && costume.accessories.length > 0) {
      const insertAcc = db.prepare(`
        INSERT INTO accessory_items (costume_id, name, quantity, category)
        VALUES (?, ?, ?, ?)
      `);
      for (const acc of costume.accessories) {
        insertAcc.run(costume.id, acc.name, acc.quantity, acc.category);
      }
    }
  });

  tx();
  return getCostumeById(costume.id);
}

export function updateCostume(
  id: string,
  updates: Partial<Omit<Costume, 'id' | 'created_at' | 'updated_at'>> & {
    accessories?: Omit<AccessoryItem, 'id' | 'costume_id'>[];
  }
) {
  const tx = db.transaction(() => {
    const fields = Object.keys(updates)
      .filter((k) => k !== 'accessories')
      .map((k) => `${k} = @${k}`)
      .join(', ');

    if (fields) {
      db.prepare(`UPDATE costumes SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({
        ...updates,
        id,
      });
    }

    if (updates.accessories !== undefined) {
      db.prepare('DELETE FROM accessory_items WHERE costume_id = ?').run(id);

      if (updates.accessories.length > 0) {
        const insertAcc = db.prepare(`
          INSERT INTO accessory_items (costume_id, name, quantity, category)
          VALUES (?, ?, ?, ?)
        `);
        for (const acc of updates.accessories) {
          insertAcc.run(id, acc.name, acc.quantity, acc.category);
        }
      }
    }
  });

  tx();
  return getCostumeById(id);
}

export function deleteCostume(id: string): boolean {
  const result = db.prepare('DELETE FROM costumes WHERE id = ?').run(id);
  return result.changes > 0;
}

export function markAsWashed(id: string): Costume | null {
  db.prepare(`
    UPDATE costumes SET wash_status = 'clean', status = CASE WHEN status = 'washing' THEN 'available' ELSE status END, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
  return getCostumeById(id);
}

export function getWashList() {
  return db.prepare(`
    SELECT * FROM costumes
    WHERE wash_status = 'dirty' OR status = 'washing'
    ORDER BY updated_at DESC
  `).all() as Costume[];
}
