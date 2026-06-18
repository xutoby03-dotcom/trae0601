import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { Master } from '../../shared/types.js';

const router = Router();

function rowToMaster(row: any): Master {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    status: row.status,
    createdAt: row.created_at,
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const status = req.query.status as string;

    let sql = 'SELECT * FROM masters WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];
    const masters = rows.map(rowToMaster);
    res.json(masters);
  } catch (error) {
    console.error('Get masters error:', error);
    res.status(500).json({ error: '获取师傅列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM masters WHERE id = ?').get(req.params.id) as any;

    if (!row) {
      return res.status(404).json({ error: '师傅不存在' });
    }

    res.json(rowToMaster(row));
  } catch (error) {
    console.error('Get master error:', error);
    res.status(500).json({ error: '获取师傅信息失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, phone, avatarUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: '师傅姓名不能为空' });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      'INSERT INTO masters (id, name, phone, avatar_url) VALUES (?, ?, ?, ?)'
    ).run(id, name, phone || '', avatarUrl || '');

    const row = db.prepare('SELECT * FROM masters WHERE id = ?').get(id) as any;
    res.status(201).json(rowToMaster(row));
  } catch (error) {
    console.error('Create master error:', error);
    res.status(500).json({ error: '创建师傅失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, phone, avatarUrl, status } = req.body;
    const { id } = req.params;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM masters WHERE id = ?').get(id) as any;

    if (!existing) {
      return res.status(404).json({ error: '师傅不存在' });
    }

    db.prepare(
      `UPDATE masters SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        avatar_url = COALESCE(?, avatar_url),
        status = COALESCE(?, status)
      WHERE id = ?`
    ).run(
      name ?? null,
      phone ?? null,
      avatarUrl ?? null,
      status ?? null,
      id
    );

    const row = db.prepare('SELECT * FROM masters WHERE id = ?').get(id) as any;
    res.json(rowToMaster(row));
  } catch (error) {
    console.error('Update master error:', error);
    res.status(500).json({ error: '更新师傅信息失败' });
  }
});

export default router;
