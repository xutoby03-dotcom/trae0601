import { db } from '../db/connection';
import { Booking } from '../../shared/types';

function mapRow(row: any): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    chairId: row.chair_id,
    chairNumber: row.chair_number,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    checkedInAt: row.checked_in_at,
    endedAt: row.ended_at,
    cleanupConfirmed: !!row.cleanup_confirmed,
    damageReported: !!row.damage_reported,
    damageNote: row.damage_note,
  };
}

export class BookingRepository {
  create(data: {
    userId: number;
    chairId: number;
    date: string;
    startTime: string;
    endTime: string;
  }): number {
    const result = db.prepare(`
      INSERT INTO bookings (user_id, chair_id, date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.userId, data.chairId, data.date, data.startTime, data.endTime);
    return result.lastInsertRowid as number;
  }

  findById(id: number): Booking | undefined {
    const row = db.prepare(`
      SELECT b.*, u.name as user_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.id = ?
    `).get(id) as any | undefined;
    return row ? mapRow(row) : undefined;
  }

  findByUserId(userId: number): Booking[] {
    const rows = db.prepare(`
      SELECT b.*, u.name as user_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.start_time DESC
    `).all(userId) as any[];
    return rows.map(mapRow);
  }

  findConflicting(chairId: number, date: string, startTime: string, endTime: string): Booking[] {
    const rows = db.prepare(`
      SELECT b.*, u.name as user_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.chair_id = ? AND b.date = ?
      AND b.status IN ('pending', 'checked_in')
      AND (
        (b.start_time < ? AND b.end_time > ?) OR
        (b.start_time >= ? AND b.start_time < ?)
      )
    `).all(chairId, date, endTime, startTime, startTime, endTime) as any[];
    return rows.map(mapRow);
  }

  findUserConsecutiveBookings(userId: number, date: string, startTime: string, endTime: string): Booking[] {
    const rows = db.prepare(`
      SELECT b.*, u.name as user_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.user_id = ? AND b.date = ?
      AND b.status IN ('pending', 'checked_in')
      AND b.end_time >= ? AND b.start_time <= ?
    `).all(userId, date, startTime, endTime) as any[];
    return rows.map(mapRow);
  }

  updateStatus(id: number, status: Booking['status']): void {
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
  }

  checkin(id: number, checkedInAt: string): void {
    db.prepare('UPDATE bookings SET status = ?, checked_in_at = ? WHERE id = ?')
      .run('checked_in', checkedInAt, id);
  }

  endUsage(id: number, endedAt: string): void {
    db.prepare('UPDATE bookings SET status = ?, ended_at = ? WHERE id = ?')
      .run('completed', endedAt, id);
  }

  confirmCleanup(id: number, damageReported: boolean, damageNote?: string): void {
    db.prepare(`
      UPDATE bookings 
      SET cleanup_confirmed = 1, damage_reported = ?, damage_note = ? 
      WHERE id = ?
    `).run(damageReported ? 1 : 0, damageNote || null, id);
  }

  findNoShows(): Booking[] {
    const rows = db.prepare(`
      SELECT b.*, u.name as user_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.status = 'no_show'
      ORDER BY b.date DESC, b.start_time DESC
    `).all() as any[];
    return rows.map(mapRow);
  }
}

export const bookingRepository = new BookingRepository();
