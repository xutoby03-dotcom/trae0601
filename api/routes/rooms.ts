import { Router } from 'express';
import { db } from '../db/index.js';
import type { Room, RoomForm } from '../../shared/types.js';

interface RoomRow {
  id: number;
  name: string;
  key_number: string;
  available_time: string;
  deposit: number;
  manager: string;
  door_photo: string | null;
  created_at: string;
}

const router = Router();

function rowToRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    keyNumber: row.key_number,
    availableTime: row.available_time,
    deposit: row.deposit,
    manager: row.manager,
    doorPhoto: row.door_photo || '',
    createdAt: row.created_at,
  };
}

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM rooms ORDER BY id ASC').all() as RoomRow[];
    const rooms = rows.map(rowToRoom);
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取房间列表失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id) as RoomRow | undefined;
    if (!row) {
      res.status(404).json({ error: '房间不存在' });
      return;
    }
    res.json(rowToRoom(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取房间详情失败' });
  }
});

router.post('/', (req, res) => {
  try {
    const form: RoomForm = req.body;

    if (!form.name || !form.keyNumber || !form.availableTime || !form.manager) {
      res.status(400).json({ error: '请填写必填字段' });
      return;
    }

    const existing = db.prepare('SELECT id FROM rooms WHERE key_number = ?').get(form.keyNumber) as { id: number } | undefined;
    if (existing) {
      res.status(400).json({ error: '钥匙编号已存在' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO rooms (name, key_number, available_time, deposit, manager, door_photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      form.name,
      form.keyNumber,
      form.availableTime,
      form.deposit || 0,
      form.manager,
      form.doorPhoto || null,
    );

    const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid) as RoomRow;
    res.status(201).json(rowToRoom(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建房间失败' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const form: RoomForm = req.body;
    const id = Number(req.params.id);

    const existingRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as RoomRow | undefined;
    if (!existingRoom) {
      res.status(404).json({ error: '房间不存在' });
      return;
    }

    if (form.keyNumber && form.keyNumber !== existingRoom.key_number) {
      const existing = db.prepare('SELECT id FROM rooms WHERE key_number = ? AND id != ?').get(form.keyNumber, id) as { id: number } | undefined;
      if (existing) {
        res.status(400).json({ error: '钥匙编号已存在' });
        return;
      }
    }

    db.prepare(`
      UPDATE rooms
      SET name = ?, key_number = ?, available_time = ?, deposit = ?, manager = ?, door_photo = ?
      WHERE id = ?
    `).run(
      form.name ?? existingRoom.name,
      form.keyNumber ?? existingRoom.key_number,
      form.availableTime ?? existingRoom.available_time,
      form.deposit ?? existingRoom.deposit,
      form.manager ?? existingRoom.manager,
      form.doorPhoto !== undefined ? (form.doorPhoto || null) : existingRoom.door_photo,
      id,
    );

    const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as RoomRow;
    res.json(rowToRoom(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新房间失败' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    const borrowCount = db.prepare('SELECT COUNT(*) as count FROM borrows WHERE room_id = ?').get(id) as { count: number };
    if (borrowCount.count > 0) {
      res.status(400).json({ error: '该房间有关联的借用记录，无法删除' });
      return;
    }

    const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: '房间不存在' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除房间失败' });
  }
});

export default router;
