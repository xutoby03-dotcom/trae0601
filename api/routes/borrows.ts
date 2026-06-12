import { Router } from 'express';
import { db } from '../db/index.js';
import type { Borrow, BorrowForm, ReturnForm } from '../../shared/types.js';

interface BorrowRow {
  id: number;
  room_id: number;
  room_name: string;
  activity_name: string;
  borrower_name: string;
  phone: string;
  start_time: string;
  end_time: string;
  deposit_status: string;
  status: string;
  return_checklist: string | null;
  returned_at: string | null;
  created_at: string;
}

const router = Router();

function rowToBorrow(row: BorrowRow): Borrow {
  let returnChecklist;
  if (row.return_checklist) {
    try {
      returnChecklist = JSON.parse(row.return_checklist);
    } catch {
      returnChecklist = undefined;
    }
  }

  let status = row.status;
  if (status === 'borrowed' && new Date(row.end_time) < new Date()) {
    status = 'overdue';
  }

  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.room_name,
    activityName: row.activity_name,
    borrowerName: row.borrower_name,
    phone: row.phone,
    startTime: row.start_time,
    endTime: row.end_time,
    depositStatus: row.deposit_status as Borrow['depositStatus'],
    status: status as Borrow['status'],
    returnChecklist,
    returnedAt: row.returned_at || undefined,
    createdAt: row.created_at,
  };
}

function getBorrowsQuery(status?: string) {
  let sql = `
    SELECT b.*, r.name as room_name
    FROM borrows b
    LEFT JOIN rooms r ON b.room_id = r.id
  `;
  const params: any[] = [];

  if (status) {
    if (status === 'overdue') {
      sql += ` WHERE b.status = 'borrowed' AND b.end_time < ?`;
      params.push(new Date().toISOString());
    } else {
      sql += ' WHERE b.status = ?';
      params.push(status);
    }
  }

  sql += ' ORDER BY b.created_at DESC';
  return { sql, params };
}

router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const { sql, params } = getBorrowsQuery(status as string | undefined);
    const rows = db.prepare(sql).all(...params) as BorrowRow[];
    const borrows = rows.map(rowToBorrow);
    res.json(borrows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取借用记录失败' });
  }
});

router.get('/overdue', (req, res) => {
  try {
    const now = new Date().toISOString();
    const rows = db.prepare(`
      SELECT b.*, r.name as room_name
      FROM borrows b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'borrowed' AND b.end_time < ?
      ORDER BY b.end_time ASC
    `).all(now) as BorrowRow[];
    const borrows = rows.map(rowToBorrow);
    res.json(borrows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取逾期记录失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT b.*, r.name as room_name
      FROM borrows b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `).get(req.params.id) as BorrowRow | undefined;

    if (!row) {
      res.status(404).json({ error: '借用记录不存在' });
      return;
    }

    res.json(rowToBorrow(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取借用详情失败' });
  }
});

router.post('/', (req, res) => {
  try {
    const form: BorrowForm = req.body;

    if (!form.roomId || !form.activityName || !form.borrowerName || !form.phone || !form.startTime || !form.endTime) {
      res.status(400).json({ error: '请填写必填字段' });
      return;
    }

    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(form.roomId) as { id: number } | undefined;
    if (!room) {
      res.status(404).json({ error: '房间不存在' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO borrows (room_id, activity_name, borrower_name, phone, start_time, end_time, deposit_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'borrowed')
    `).run(
      form.roomId,
      form.activityName,
      form.borrowerName,
      form.phone,
      form.startTime,
      form.endTime,
      form.depositStatus || 'unpaid',
    );

    const row = db.prepare(`
      SELECT b.*, r.name as room_name
      FROM borrows b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid) as BorrowRow;

    res.status(201).json(rowToBorrow(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建借用记录失败' });
  }
});

router.put('/:id/return', (req, res) => {
  try {
    const form: ReturnForm = req.body;
    const id = Number(req.params.id);

    const borrow = db.prepare('SELECT * FROM borrows WHERE id = ?').get(id) as { id: number; status: string; deposit_status: string } | undefined;
    if (!borrow) {
      res.status(404).json({ error: '借用记录不存在' });
      return;
    }

    if (borrow.status === 'returned') {
      res.status(400).json({ error: '该借用已归还' });
      return;
    }

    const checklist = {
      door: form.doorChecked,
      window: form.windowChecked,
      light: form.lightChecked,
      aircon: form.airconChecked,
    };

    const depositStatus = form.depositRefunded ? 'refunded' : borrow.deposit_status;

    db.prepare(`
      UPDATE borrows
      SET status = 'returned', return_checklist = ?, returned_at = ?, deposit_status = ?
      WHERE id = ?
    `).run(
      JSON.stringify(checklist),
      new Date().toISOString(),
      depositStatus,
      id,
    );

    const row = db.prepare(`
      SELECT b.*, r.name as room_name
      FROM borrows b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `).get(id) as BorrowRow;

    res.json(rowToBorrow(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '归还登记失败' });
  }
});

export default router;
