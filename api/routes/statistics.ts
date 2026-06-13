import { Router } from 'express';
import { db } from '../db/index.js';
import type { OverviewStats, ClassUsage, VacancyRate } from '../../shared/types.js';

const router = Router();

router.get('/overview', (_req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const todayReservations = (db.prepare(`
    SELECT COUNT(*) as count FROM reservations WHERE date = ? AND status != 'absent'
  `).get(today) as { count: number }).count;

  const todayCheckedIn = (db.prepare(`
    SELECT COUNT(*) as count FROM check_ins ci
    JOIN reservations r ON ci.reservation_id = r.id
    WHERE r.date = ? AND ci.status = 'checked_in'
  `).get(today) as { count: number }).count;

  const totalBeds = (db.prepare('SELECT COUNT(*) as count FROM beds').get() as { count: number }).count;
  const occupiedToday = (db.prepare(`
    SELECT COUNT(DISTINCT bed_id) as count FROM reservations WHERE date = ? AND status != 'absent'
  `).get(today) as { count: number }).count;
  const todayVacant = totalBeds - occupiedToday;

  const pendingDisinfection = (db.prepare(`
    SELECT COUNT(*) as count FROM beds WHERE disinfection_status != 'completed'
  `).get() as { count: number }).count;

  const stats: OverviewStats = {
    todayReservations,
    todayCheckedIn,
    todayVacant,
    pendingDisinfection,
  };

  res.json(stats);
});

router.get('/class-usage', (req, res) => {
  const { startDate, endDate } = req.query;
  let sql = `
    SELECT class_name as className, COUNT(*) as count
    FROM reservations WHERE status != 'absent'
  `;
  const params: any[] = [];

  if (startDate) {
    sql += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND date <= ?';
    params.push(endDate);
  }
  sql += ' GROUP BY class_name ORDER BY count DESC';

  const rows = db.prepare(sql).all(...params) as ClassUsage[];
  res.json(rows);
});

router.get('/vacancy', (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const totalBeds = (db.prepare('SELECT COUNT(*) as count FROM beds').get() as { count: number }).count;
  const occupied = (db.prepare(`
    SELECT COUNT(DISTINCT bed_id) as count FROM reservations WHERE date = ? AND status != 'absent'
  `).get(targetDate) as { count: number }).count;

  const result: VacancyRate = {
    total: totalBeds,
    occupied,
    vacant: totalBeds - occupied,
    rate: totalBeds > 0 ? Number(((totalBeds - occupied) / totalBeds * 100).toFixed(1)) : 0,
  };

  res.json(result);
});

router.get('/disinfection-missed', (_req, res) => {
  const rows = db.prepare(`
    SELECT * FROM beds WHERE disinfection_status != 'completed'
    ORDER BY room, bed_number
  `).all() as any[];

  const result = rows.map((row: any) => ({
    id: row.id,
    room: row.room,
    bedNumber: row.bed_number,
    bunkType: row.bunk_type,
    isWindowSide: !!row.is_window_side,
    disinfectionStatus: row.disinfection_status,
    disinfectionDate: row.disinfection_date,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  }));

  res.json(result);
});

export default router;
