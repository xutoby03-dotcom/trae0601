import { getDb } from '../db/database.js';
import type { ReservationData, CreateReservationRequest } from '../../shared/types.js';

const GRACE_PERIOD_MINUTES = 15;

function rowToReservation(row: any): ReservationData {
  return {
    id: row.id,
    tableId: row.table_id,
    tableNumber: row.table_number || undefined,
    gameType: row.game_type,
    peopleCount: row.people_count,
    startTime: row.start_time,
    endTime: row.end_time,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    teaRequirement: row.tea_requirement,
    status: row.status as ReservationData['status'],
    checkedInAt: row.checked_in_at || undefined,
    createdAt: row.created_at,
  };
}

export function getReservationsByDate(dateStr: string): ReservationData[] {
  const db = getDb();
  const startOfDay = `${dateStr}T00:00:00`;
  const endOfDay = `${dateStr}T23:59:59`;

  const rows = db.prepare(`
    SELECT r.*, t.table_number 
    FROM reservations r
    JOIN tables t ON r.table_id = t.id
    WHERE r.start_time >= ? AND r.start_time <= ?
    ORDER BY r.start_time ASC
  `).all(startOfDay, endOfDay);

  return rows.map(rowToReservation);
}

export function getReservationById(id: number): ReservationData | undefined {
  const db = getDb();
  const row = db.prepare(`
    SELECT r.*, t.table_number 
    FROM reservations r
    JOIN tables t ON r.table_id = t.id
    WHERE r.id = ?
  `).get(id);

  return row ? rowToReservation(row) : undefined;
}

export function checkTimeConflict(tableId: number, startTime: string, endTime: string, excludeId?: number): boolean {
  const db = getDb();
  const query = `
    SELECT COUNT(*) as count FROM reservations
    WHERE table_id = ?
      AND status NOT IN ('cancelled', 'no_show', 'completed')
      AND start_time < ?
      AND end_time > ?
      ${excludeId ? 'AND id != ?' : ''}
  `;

  const stmt = db.prepare(query);
  const params = excludeId ? [tableId, endTime, startTime, excludeId] : [tableId, endTime, startTime];
  const result = stmt.get(...params) as { count: number };

  return result.count > 0;
}

export function createReservation(data: CreateReservationRequest): ReservationData | { error: string } {
  const db = getDb();

  if (checkTimeConflict(data.tableId, data.startTime, data.endTime)) {
    return { error: '该时段已有预约，请选择其他时间' };
  }

  const result = db.prepare(`
    INSERT INTO reservations (table_id, game_type, people_count, start_time, end_time, contact_name, contact_phone, tea_requirement)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.tableId,
    data.gameType,
    data.peopleCount,
    data.startTime,
    data.endTime,
    data.contactName,
    data.contactPhone,
    data.teaRequirement
  );

  return getReservationById(result.lastInsertRowid as number)!;
}

export function checkInReservation(id: number): ReservationData | undefined {
  const db = getDb();
  const reservation = getReservationById(id);
  if (!reservation) return undefined;
  if (reservation.status !== 'pending') return reservation;

  db.prepare(`
    UPDATE reservations 
    SET status = 'checked_in', checked_in_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), id);

  return getReservationById(id);
}

export function cancelReservation(id: number): ReservationData | undefined {
  const db = getDb();
  const reservation = getReservationById(id);
  if (!reservation) return undefined;

  db.prepare(`
    UPDATE reservations 
    SET status = 'cancelled'
    WHERE id = ?
  `).run(id);

  return getReservationById(id);
}

export function deleteReservation(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
  return result.changes > 0;
}

export function processAutoRelease(): number {
  const db = getDb();
  const now = new Date();

  const pendingReservations = db.prepare(`
    SELECT id, start_time FROM reservations
    WHERE status = 'pending'
  `).all() as { id: number; start_time: string }[];

  let released = 0;
  const updateStmt = db.prepare(`
    UPDATE reservations SET status = 'no_show' WHERE id = ?
  `);

  for (const res of pendingReservations) {
    const startTime = new Date(res.start_time);
    const graceEnd = new Date(startTime.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);

    if (now > graceEnd) {
      updateStmt.run(res.id);
      released++;
    }
  }

  return released;
}

export function completeExpiredReservations(): number {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db.prepare(`
    UPDATE reservations 
    SET status = 'completed'
    WHERE status IN ('pending', 'checked_in')
      AND end_time < ?
  `).run(now);

  return result.changes;
}
