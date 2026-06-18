import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { ExceptionRecord, ExceptionRecordWithDetails, ExceptionStatus, HandleMethod } from '../../shared/types.js';

const router = Router();

function rowToExceptionRecord(row: any): ExceptionRecord {
  return {
    id: row.id,
    moldId: row.mold_id,
    borrowRecordId: row.borrow_record_id,
    type: row.type,
    description: row.description,
    status: row.status as ExceptionStatus,
    handlerId: row.handler_id,
    handleMethod: row.handle_method as HandleMethod | undefined,
    handleRemark: row.handle_remark,
    handledAt: row.handled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToExceptionWithDetails(row: any): ExceptionRecordWithDetails {
  return {
    ...rowToExceptionRecord(row),
    moldName: row.mold_name,
    moldSize: row.mold_size,
    masterName: row.master_name,
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { status, moldId } = req.query;

    let sql = `
      SELECT er.*, m.name as mold_name, m.size as mold_size, ma.name as master_name
      FROM exception_records er
      JOIN molds m ON er.mold_id = m.id
      LEFT JOIN borrow_records br ON er.borrow_record_id = br.id
      LEFT JOIN masters ma ON br.master_id = ma.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND er.status = ?';
      params.push(status);
    }
    if (moldId) {
      sql += ' AND er.mold_id = ?';
      params.push(moldId);
    }

    sql += ' ORDER BY er.created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];
    const records = rows.map(rowToExceptionWithDetails);
    res.json(records);
  } catch (error) {
    console.error('Get exceptions error:', error);
    res.status(500).json({ error: '获取异常记录失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT er.*, m.name as mold_name, m.size as mold_size, ma.name as master_name
      FROM exception_records er
      JOIN molds m ON er.mold_id = m.id
      LEFT JOIN borrow_records br ON er.borrow_record_id = br.id
      LEFT JOIN masters ma ON br.master_id = ma.id
      WHERE er.id = ?
    `).get(req.params.id) as any;

    if (!row) {
      return res.status(404).json({ error: '异常记录不存在' });
    }

    res.json(rowToExceptionWithDetails(row));
  } catch (error) {
    console.error('Get exception error:', error);
    res.status(500).json({ error: '获取异常记录失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { moldId, borrowRecordId, type, description } = req.body;

    if (!moldId || !type || !description) {
      return res.status(400).json({ error: '模具ID、异常类型、描述不能为空' });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO exception_records (id, mold_id, borrow_record_id, type, description, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(id, moldId, borrowRecordId || null, type, description);

    const row = db.prepare(`
      SELECT er.*, m.name as mold_name, m.size as mold_size, ma.name as master_name
      FROM exception_records er
      JOIN molds m ON er.mold_id = m.id
      LEFT JOIN borrow_records br ON er.borrow_record_id = br.id
      LEFT JOIN masters ma ON br.master_id = ma.id
      WHERE er.id = ?
    `).get(id) as any;

    res.status(201).json(rowToExceptionWithDetails(row));
  } catch (error) {
    console.error('Create exception error:', error);
    res.status(500).json({ error: '创建异常记录失败' });
  }
});

router.put('/:id/handle', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { handlerId, handleMethod, handleRemark, status } = req.body;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM exception_records WHERE id = ?').get(id) as any;

    if (!existing) {
      return res.status(404).json({ error: '异常记录不存在' });
    }

    const newStatus = status || (handleMethod ? 'resolved' : 'processing');
    const now = new Date().toISOString();

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE exception_records SET
          handler_id = COALESCE(?, handler_id),
          handle_method = COALESCE(?, handle_method),
          handle_remark = COALESCE(?, handle_remark),
          status = ?,
          handled_at = CASE WHEN ? = 'resolved' THEN ? ELSE handled_at END
        WHERE id = ?
      `).run(
        handlerId ?? null,
        handleMethod ?? null,
        handleRemark ?? null,
        newStatus,
        newStatus,
        now,
        id
      );

      if (newStatus === 'resolved' && handleMethod === 'scrap') {
        db.prepare(`
          UPDATE molds
          SET status = 'damaged',
              available_quantity = CASE WHEN available_quantity > 0 THEN available_quantity - 1 ELSE 0 END,
              quantity = CASE WHEN quantity > 0 THEN quantity - 1 ELSE 0 END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existing.mold_id);
      } else if (newStatus === 'resolved' && handleMethod === 'repair') {
        db.prepare(`
          UPDATE molds
          SET status = 'available',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existing.mold_id);
      } else if (newStatus === 'resolved') {
        db.prepare(`
          UPDATE molds
          SET status = 'available',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existing.mold_id);
      }
    });

    transaction();

    const row = db.prepare(`
      SELECT er.*, m.name as mold_name, m.size as mold_size, ma.name as master_name
      FROM exception_records er
      JOIN molds m ON er.mold_id = m.id
      LEFT JOIN borrow_records br ON er.borrow_record_id = br.id
      LEFT JOIN masters ma ON br.master_id = ma.id
      WHERE er.id = ?
    `).get(id) as any;

    res.json(rowToExceptionWithDetails(row));
  } catch (error) {
    console.error('Handle exception error:', error);
    res.status(500).json({ error: '处理异常失败' });
  }
});

export default router;
