import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import type { CleaningRecord } from '../../shared/types.js';

const router = Router();

function rowToCleaningRecord(row: any): CleaningRecord {
  return {
    id: row.id,
    costumeId: row.costume_id,
    status: row.status as '排队中' | '清洗中' | '已完成',
    queuedAt: row.queued_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    operator: row.operator,
    costume: row.costume_id ? {
      id: row.costume_id,
      type: row.type,
      size: row.size,
      color: row.color,
      accessories: JSON.parse(row.accessories_json),
      status: row.costume_status,
      cleaningStatus: row.cleaning_status,
      photoUrl: row.photo_url,
      rfidTag: row.rfid_tag,
      remark: row.costume_remark,
      createdAt: row.costume_created_at,
      updatedAt: row.costume_updated_at
    } : undefined
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT cr.*, 
             c.type, c.size, c.color, c.accessories_json, 
             c.status as costume_status, c.cleaning_status, c.photo_url, 
             c.rfid_tag, c.remark as costume_remark, 
             c.created_at as costume_created_at, c.updated_at as costume_updated_at
      FROM cleaning_records cr
      LEFT JOIN costumes c ON cr.costume_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND cr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY cr.queued_at DESC';
    const rows = db.prepare(sql).all(...params) as any[];
    const records = rows.map(rowToCleaningRecord);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { costumeIds } = req.body as { costumeIds: string[] };
    const now = new Date().toISOString();

    const records: CleaningRecord[] = [];

    for (const costumeId of costumeIds) {
      const existing = db.prepare(`
        SELECT id FROM cleaning_records 
        WHERE costume_id = ? AND status IN ('排队中', '清洗中')
      `).get(costumeId) as any;

      if (!existing) {
        const id = uuidv4();
        db.prepare(`
          INSERT INTO cleaning_records (id, costume_id, status, queued_at)
          VALUES (?, ?, '排队中', ?)
        `).run(id, costumeId, now);

        db.prepare(`
          UPDATE costumes SET status = '待清洗', cleaning_status = '待清洗'
          WHERE id = ?
        `).run(costumeId);

        const row = db.prepare(`
          SELECT cr.*, 
                 c.type, c.size, c.color, c.accessories_json, 
                 c.status as costume_status, c.cleaning_status, c.photo_url, 
                 c.rfid_tag, c.remark as costume_remark, 
                 c.created_at as costume_created_at, c.updated_at as costume_updated_at
          FROM cleaning_records cr
          LEFT JOIN costumes c ON cr.costume_id = c.id
          WHERE cr.id = ?
        `).get(id);
        records.push(rowToCleaningRecord(row));
      }
    }

    res.status(201).json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/start', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operator } = req.body;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE cleaning_records 
      SET status = '清洗中', started_at = ?, operator = ?
      WHERE id = ? AND status = '排队中'
    `).run(now, operator, id);

    if (result.changes === 0) {
      return res.status(400).json({ error: '清洗记录状态不正确或不存在' });
    }

    const record = db.prepare(`
      SELECT cr.*, 
             c.type, c.size, c.color, c.accessories_json, 
             c.status as costume_status, c.cleaning_status, c.photo_url, 
             c.rfid_tag, c.remark as costume_remark, 
             c.created_at as costume_created_at, c.updated_at as costume_updated_at
      FROM cleaning_records cr
      LEFT JOIN costumes c ON cr.costume_id = c.id
      WHERE cr.id = ?
    `).get(id);

    res.json(rowToCleaningRecord(record));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/complete', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE cleaning_records 
      SET status = '已完成', completed_at = ?
      WHERE id = ? AND status = '清洗中'
    `).run(now, id);

    if (result.changes === 0) {
      return res.status(400).json({ error: '清洗记录状态不正确或不存在' });
    }

    const record = db.prepare(`
      SELECT cr.*, 
             c.type, c.size, c.color, c.accessories_json, 
             c.status as costume_status, c.cleaning_status, c.photo_url, 
             c.rfid_tag, c.remark as costume_remark, 
             c.created_at as costume_created_at, c.updated_at as costume_updated_at
      FROM cleaning_records cr
      LEFT JOIN costumes c ON cr.costume_id = c.id
      WHERE cr.id = ?
    `).get(id) as any;

    db.prepare(`
      UPDATE costumes 
      SET status = '在库', cleaning_status = '已清洗'
      WHERE id = ?
    `).run(record.costume_id);

    db.prepare(`
      UPDATE costumes 
      SET cleaning_status = '干净'
      WHERE id = ?
    `).run(record.costume_id);

    res.json(rowToCleaningRecord(record));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
