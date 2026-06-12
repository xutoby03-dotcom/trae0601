import { Router } from 'express';
import { db } from '../db/index.js';
import type { ExceptionRecord, ExceptionForm } from '../../shared/types.js';

interface ExceptionRow {
  id: number;
  borrow_id: number | null;
  room_id: number;
  room_name: string;
  type: string;
  description: string;
  measure: string | null;
  compensation: number;
  status: string;
  created_at: string;
}

const router = Router();

function rowToException(row: ExceptionRow): ExceptionRecord {
  return {
    id: row.id,
    borrowId: row.borrow_id || undefined,
    roomId: row.room_id,
    roomName: row.room_name,
    type: row.type as ExceptionRecord['type'],
    description: row.description,
    measure: row.measure || '',
    compensation: row.compensation,
    status: row.status as ExceptionRecord['status'],
    createdAt: row.created_at,
  };
}

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.*, r.name as room_name
      FROM exceptions e
      LEFT JOIN rooms r ON e.room_id = r.id
      ORDER BY e.created_at DESC
    `).all() as ExceptionRow[];
    const exceptions = rows.map(rowToException);
    res.json(exceptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取异常记录失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT e.*, r.name as room_name
      FROM exceptions e
      LEFT JOIN rooms r ON e.room_id = r.id
      WHERE e.id = ?
    `).get(req.params.id) as ExceptionRow | undefined;

    if (!row) {
      res.status(404).json({ error: '异常记录不存在' });
      return;
    }

    res.json(rowToException(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取异常详情失败' });
  }
});

router.post('/', (req, res) => {
  try {
    const form: ExceptionForm = req.body;

    if (!form.roomId || !form.type || !form.description) {
      res.status(400).json({ error: '请填写必填字段' });
      return;
    }

    const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(form.roomId) as { id: number } | undefined;
    if (!room) {
      res.status(404).json({ error: '房间不存在' });
      return;
    }

    if (form.borrowId) {
      const borrow = db.prepare('SELECT id FROM borrows WHERE id = ?').get(form.borrowId) as { id: number } | undefined;
      if (!borrow) {
        res.status(404).json({ error: '关联的借用记录不存在' });
        return;
      }
    }

    const result = db.prepare(`
      INSERT INTO exceptions (borrow_id, room_id, type, description, measure, compensation, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      form.borrowId || null,
      form.roomId,
      form.type,
      form.description,
      form.measure || '',
      form.compensation || 0,
      form.status || 'pending',
    );

    const row = db.prepare(`
      SELECT e.*, r.name as room_name
      FROM exceptions e
      LEFT JOIN rooms r ON e.room_id = r.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid) as ExceptionRow;

    res.status(201).json(rowToException(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建异常记录失败' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const form: ExceptionForm = req.body;
    const id = Number(req.params.id);

    const existing = db.prepare('SELECT * FROM exceptions WHERE id = ?').get(id) as ExceptionRow | undefined;
    if (!existing) {
      res.status(404).json({ error: '异常记录不存在' });
      return;
    }

    db.prepare(`
      UPDATE exceptions
      SET borrow_id = ?, room_id = ?, type = ?, description = ?, measure = ?, compensation = ?, status = ?
      WHERE id = ?
    `).run(
      form.borrowId !== undefined ? (form.borrowId || null) : existing.borrow_id,
      form.roomId ?? existing.room_id,
      form.type ?? existing.type,
      form.description ?? existing.description,
      form.measure !== undefined ? form.measure : existing.measure,
      form.compensation !== undefined ? form.compensation : existing.compensation,
      form.status ?? existing.status,
      id,
    );

    const row = db.prepare(`
      SELECT e.*, r.name as room_name
      FROM exceptions e
      LEFT JOIN rooms r ON e.room_id = r.id
      WHERE e.id = ?
    `).get(id) as ExceptionRow;

    res.json(rowToException(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新异常记录失败' });
  }
});

export default router;
