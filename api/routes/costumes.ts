import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import type { Costume, CostumeSize, TimeSlot, CostumeStatus, CostumeType, CleaningStatus } from '../../shared/types.js';

const router = Router();

function rowToCostume(row: any): Costume {
  return {
    id: row.id,
    type: row.type as CostumeType,
    size: row.size as CostumeSize,
    color: row.color,
    accessories: JSON.parse(row.accessories_json),
    status: row.status as CostumeStatus,
    cleaningStatus: row.cleaning_status as CleaningStatus,
    photoUrl: row.photo_url,
    rfidTag: row.rfid_tag,
    remark: row.remark,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const { type, size, status } = req.query;
    let sql = 'SELECT * FROM costumes WHERE 1=1';
    const params: any[] = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (size) {
      sql += ' AND size = ?';
      params.push(size);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY size, id';
    const rows = db.prepare(sql).all(...params);
    const costumes = rows.map(rowToCostume);
    res.json(costumes);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/availability', (req: Request, res: Response) => {
  try {
    const { date, timeSlot } = req.query as { date: string; timeSlot: TimeSlot };
    
    if (!date || !timeSlot) {
      return res.status(400).json({ error: '请提供日期和时段' });
    }

    const reservedSql = `
      SELECT r.size_breakdown_json 
      FROM reservations r
      WHERE r.shoot_date = ? 
        AND r.time_slot = ? 
        AND r.status IN ('待审核', '已通过')
    `;

    const reservedRows = db.prepare(reservedSql).all(date, timeSlot) as { size_breakdown_json: string }[];
    
    const reservedCount: Record<string, number> = {
      XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
    };

    for (const row of reservedRows) {
      const breakdown = JSON.parse(row.size_breakdown_json);
      for (const [size, count] of Object.entries(breakdown)) {
        reservedCount[size] = (reservedCount[size] || 0) + (count as number);
      }
    }

    const totalSql = `
      SELECT size, COUNT(*) as count 
      FROM costumes 
      WHERE status = '在库' 
        AND cleaning_status = '干净'
      GROUP BY size
    `;
    const totalRows = db.prepare(totalSql).all() as { size: string; count: number }[];
    
    const totalCount: Record<string, number> = {
      XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
    };
    
    for (const row of totalRows) {
      totalCount[row.size] = row.count;
    }

    const available: Record<string, number> = {};
    for (const size of Object.keys(totalCount)) {
      available[size] = Math.max(0, totalCount[size] - reservedCount[size]);
    }

    res.json({ available });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM costumes WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: '服装不存在' });
    }
    res.json(rowToCostume(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { type, size, color, accessories, status, cleaningStatus, photoUrl, rfidTag, remark } = req.body;
    
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO costumes (id, type, size, color, accessories_json, status, cleaning_status, photo_url, rfid_tag, remark, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      type,
      size,
      color,
      JSON.stringify(accessories),
      status || '在库',
      cleaningStatus || '干净',
      photoUrl,
      rfidTag,
      remark,
      now,
      now
    );

    const row = db.prepare('SELECT * FROM costumes WHERE id = ?').get(id);
    res.status(201).json(rowToCostume(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, size, color, accessories, status, cleaningStatus, photoUrl, rfidTag, remark } = req.body;
    
    const existing = db.prepare('SELECT * FROM costumes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '服装不存在' });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: any[] = [];

    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (size !== undefined) { updates.push('size = ?'); params.push(size); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (accessories !== undefined) { updates.push('accessories_json = ?'); params.push(JSON.stringify(accessories)); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (cleaningStatus !== undefined) { updates.push('cleaning_status = ?'); params.push(cleaningStatus); }
    if (photoUrl !== undefined) { updates.push('photo_url = ?'); params.push(photoUrl); }
    if (rfidTag !== undefined) { updates.push('rfid_tag = ?'); params.push(rfidTag); }
    if (remark !== undefined) { updates.push('remark = ?'); params.push(remark); }
    
    updates.push('updated_at = ?');
    params.push(now, id);

    db.prepare(`UPDATE costumes SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const row = db.prepare('SELECT * FROM costumes WHERE id = ?').get(id);
    res.json(rowToCostume(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM costumes WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: '服装不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
