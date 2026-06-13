import { Router } from 'express';
import { db } from '../db/index.js';
import type { CheckInRecord, Reservation, Bed } from '../../shared/types.js';

const router = Router();

interface CheckInDetail extends CheckInRecord {
  reservation: Reservation & { bed?: Bed };
}

router.get('/', (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT ci.*,
      r.id as r_id, r.bed_id, r.class_name, r.student_name, r.date as r_date,
      r.time_slot, r.allergy_note, r.parent_confirmed, r.status as r_status, r.created_at as r_created_at,
      b.room, b.bed_number, b.bunk_type, b.is_window_side,
      b.disinfection_status, b.disinfection_date, b.photo_url, b.created_at as b_created_at
    FROM check_ins ci
    LEFT JOIN reservations r ON ci.reservation_id = r.id
    LEFT JOIN beds b ON r.bed_id = b.id
    WHERE r.date = ?
    ORDER BY b.room, b.bed_number
  `).all(targetDate) as any[];

  const result: CheckInDetail[] = rows.map((row: any) => ({
    id: row.id,
    reservationId: row.reservation_id,
    checkInTime: row.check_in_time,
    status: row.status,
    reservation: {
      id: row.r_id,
      bedId: row.bed_id,
      className: row.class_name,
      studentName: row.student_name,
      date: row.r_date,
      timeSlot: row.time_slot,
      allergyNote: row.allergy_note || '',
      parentConfirmed: !!row.parent_confirmed,
      status: row.r_status,
      createdAt: row.r_created_at,
      bed: {
        id: row.bed_id,
        room: row.room,
        bedNumber: row.bed_number,
        bunkType: row.bunk_type,
        isWindowSide: !!row.is_window_side,
        disinfectionStatus: row.disinfection_status,
        disinfectionDate: row.disinfection_date,
        photoUrl: row.photo_url,
        createdAt: row.b_created_at,
      },
    },
  }));

  res.json(result);
});

router.post('/:reservationId/check-in', (req, res) => {
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE check_ins SET status = 'checked_in', check_in_time = ? WHERE reservation_id = ?
  `).run(now, req.params.reservationId);

  if (result.changes === 0) {
    return res.status(404).json({ error: '签到记录不存在' });
  }

  db.prepare(`UPDATE reservations SET status = 'checked_in' WHERE id = ?`).run(req.params.reservationId);

  const row = db.prepare('SELECT * FROM check_ins WHERE reservation_id = ?').get(req.params.reservationId);
  res.json(row);
});

router.post('/:reservationId/absent', (req, res) => {
  const result = db.prepare(`
    UPDATE check_ins SET status = 'absent' WHERE reservation_id = ?
  `).run(req.params.reservationId);

  if (result.changes === 0) {
    return res.status(404).json({ error: '签到记录不存在' });
  }

  db.prepare(`UPDATE reservations SET status = 'absent' WHERE id = ?`).run(req.params.reservationId);

  const row = db.prepare('SELECT * FROM check_ins WHERE reservation_id = ?').get(req.params.reservationId);
  res.json(row);
});

router.post('/:reservationId/swap', (req, res) => {
  const { toBedId, reason } = req.body;

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.reservationId) as any;
  if (!reservation) {
    return res.status(404).json({ error: '预约不存在' });
  }

  const toBed = db.prepare('SELECT * FROM beds WHERE id = ?').get(toBedId);
  if (!toBed) {
    return res.status(400).json({ error: '目标床位不存在' });
  }
  if ((toBed as any).disinfection_status !== 'completed') {
    return res.status(400).json({ error: '目标床位消毒未完成' });
  }

  const conflict = db.prepare(`
    SELECT * FROM reservations WHERE bed_id = ? AND date = ? AND time_slot = ? AND status != 'absent' AND id != ?
  `).get(toBedId, reservation.date, reservation.time_slot, req.params.reservationId);
  if (conflict) {
    return res.status(400).json({ error: '目标床位在此时段已被占用' });
  }

  const fromBedId = reservation.bed_id;

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO bed_swaps (reservation_id, from_bed_id, to_bed_id, reason) VALUES (?, ?, ?, ?)
    `).run(req.params.reservationId, fromBedId, toBedId, reason || null);

    db.prepare(`UPDATE reservations SET bed_id = ?, status = 'swapped' WHERE id = ?`).run(toBedId, req.params.reservationId);
  });

  tx();

  res.json({ success: true, message: '换床成功' });
});

export default router;
