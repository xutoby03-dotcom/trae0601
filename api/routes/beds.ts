import { Router } from 'express';
import { db } from '../db/index.js';
import type { Bed, DisinfectionStatus } from '../../shared/types.js';

const router = Router();

function rowToBed(row: any): Bed {
  return {
    id: row.id,
    room: row.room,
    bedNumber: row.bed_number,
    bunkType: row.bunk_type,
    isWindowSide: !!row.is_window_side,
    disinfectionStatus: row.disinfection_status,
    disinfectionDate: row.disinfection_date,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

router.get('/', (req, res) => {
  const { room, disinfectionStatus } = req.query;
  let sql = 'SELECT * FROM beds WHERE 1=1';
  const params: any[] = [];

  if (room) {
    sql += ' AND room = ?';
    params.push(room);
  }
  if (disinfectionStatus) {
    sql += ' AND disinfection_status = ?';
    params.push(disinfectionStatus);
  }
  sql += ' ORDER BY room, bed_number';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(rowToBed));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM beds WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: '床位不存在' });
  }
  res.json(rowToBed(row));
});

router.post('/', (req, res) => {
  const { room, bedNumber, bunkType, isWindowSide, disinfectionStatus, disinfectionDate, photoUrl } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO beds (room, bed_number, bunk_type, is_window_side, disinfection_status, disinfection_date, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      room,
      bedNumber,
      bunkType,
      isWindowSide ? 1 : 0,
      disinfectionStatus || 'pending',
      disinfectionDate || null,
      photoUrl || null,
    );

    const row = db.prepare('SELECT * FROM beds WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(rowToBed(row));
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: '该房间内已存在相同床号' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const { room, bedNumber, bunkType, isWindowSide, disinfectionStatus, disinfectionDate, photoUrl } = req.body;

  try {
    const result = db.prepare(`
      UPDATE beds SET room = ?, bed_number = ?, bunk_type = ?, is_window_side = ?,
        disinfection_status = ?, disinfection_date = ?, photo_url = ? WHERE id = ?
    `).run(
      room,
      bedNumber,
      bunkType,
      isWindowSide ? 1 : 0,
      disinfectionStatus,
      disinfectionDate || null,
      photoUrl || null,
      req.params.id,
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: '床位不存在' });
    }

    const row = db.prepare('SELECT * FROM beds WHERE id = ?').get(req.params.id);
    res.json(rowToBed(row));
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: '该房间内已存在相同床号' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/disinfection', (req, res) => {
  const { disinfectionStatus, disinfectionDate } = req.body as { disinfectionStatus: DisinfectionStatus; disinfectionDate?: string };

  const result = db.prepare(`
    UPDATE beds SET disinfection_status = ?, disinfection_date = ? WHERE id = ?
  `).run(disinfectionStatus, disinfectionDate || new Date().toISOString().split('T')[0], req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: '床位不存在' });
  }

  const row = db.prepare('SELECT * FROM beds WHERE id = ?').get(req.params.id);
  res.json(rowToBed(row));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM beds WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: '床位不存在' });
  }
  res.status(204).send();
});

export default router;
