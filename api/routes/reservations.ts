import { Router } from 'express';
import { db } from '../db/index.js';
import type { Reservation } from '../../shared/types.js';

const router = Router();

function rowToReservation(row: any): Reservation {
  return {
    id: row.id,
    bedId: row.bed_id,
    className: row.class_name,
    studentName: row.student_name,
    date: row.date,
    timeSlot: row.time_slot,
    allergyNote: row.allergy_note || '',
    parentConfirmed: !!row.parent_confirmed,
    status: row.status,
    createdAt: row.created_at,
    bed: row.bed_id ? {
      id: row.bed_id,
      room: row.room,
      bedNumber: row.bed_number,
      bunkType: row.bunk_type,
      isWindowSide: !!row.is_window_side,
      disinfectionStatus: row.disinfection_status,
      disinfectionDate: row.disinfection_date,
      photoUrl: row.photo_url,
      createdAt: row.bed_created_at,
    } : undefined,
  };
}

router.get('/', (req, res) => {
  const { date, className } = req.query;
  let sql = `
    SELECT r.*, b.room, b.bed_number, b.bunk_type, b.is_window_side,
      b.disinfection_status, b.disinfection_date, b.photo_url, b.created_at as bed_created_at
    FROM reservations r
    LEFT JOIN beds b ON r.bed_id = b.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (date) {
    sql += ' AND r.date = ?';
    params.push(date);
  }
  if (className) {
    sql += ' AND r.class_name = ?';
    params.push(className);
  }
  sql += ' ORDER BY r.date DESC, r.created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(rowToReservation));
});

router.post('/check-conflict', (req, res) => {
  const { bedId, date, timeSlot } = req.body;

  const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId) as any;
  if (!bed) {
    return res.json({ available: false, reason: '床位不存在' });
  }
  if (bed.disinfection_status !== 'completed') {
    return res.json({ available: false, reason: '该床位消毒未完成，不能预约' });
  }

  const conflict = db.prepare(`
    SELECT * FROM reservations WHERE bed_id = ? AND date = ? AND time_slot = ? AND status != 'absent'
  `).get(bedId, date, timeSlot);

  if (conflict) {
    return res.json({ available: false, reason: '该床位在此时段已被预约' });
  }

  res.json({ available: true });
});

router.post('/', (req, res) => {
  const { bedId, className, studentName, date, timeSlot, allergyNote, parentConfirmed } = req.body;

  const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId) as any;
  if (!bed) {
    return res.status(400).json({ error: '床位不存在' });
  }
  if (bed.disinfection_status !== 'completed') {
    return res.status(400).json({ error: '该床位消毒未完成，不能预约' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO reservations (bed_id, class_name, student_name, date, time_slot, allergy_note, parent_confirmed, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      bedId,
      className,
      studentName,
      date,
      timeSlot || 'full',
      allergyNote || '',
      parentConfirmed ? 1 : 0,
    );

    db.prepare(`
      INSERT INTO check_ins (reservation_id, status) VALUES (?, 'pending')
    `).run(result.lastInsertRowid);

    const row = db.prepare(`
      SELECT r.*, b.room, b.bed_number, b.bunk_type, b.is_window_side,
        b.disinfection_status, b.disinfection_date, b.photo_url, b.created_at as bed_created_at
      FROM reservations r
      LEFT JOIN beds b ON r.bed_id = b.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(rowToReservation(row));
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: '该床位在此时段已被预约' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM check_ins WHERE reservation_id = ?').run(req.params.id);
  const result = db.prepare('DELETE FROM reservations WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: '预约不存在' });
  }
  res.status(204).send();
});

export default router;
