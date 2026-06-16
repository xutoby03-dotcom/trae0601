import { db } from '../db/connection';
import { Chair } from '../../shared/types';

function mapRow(row: any): Chair {
  return {
    id: row.id,
    chairNumber: row.chair_number,
    location: row.location,
    items: JSON.parse(row.items),
    lastCleanedAt: row.last_cleaned_at,
    lastCleanedBy: row.last_cleaned_by,
    lastCleanedByName: row.last_cleaned_by_name || null,
    photoUrls: JSON.parse(row.photo_urls),
    status: row.status,
  };
}

export class ChairRepository {
  findAll(): Chair[] {
    const rows = db.prepare(`
      SELECT c.*, u.name as last_cleaned_by_name
      FROM chairs c
      LEFT JOIN users u ON c.last_cleaned_by = u.id
      ORDER BY c.chair_number
    `).all() as any[];
    return rows.map(mapRow);
  }

  findById(id: number): Chair | undefined {
    const row = db.prepare(`
      SELECT c.*, u.name as last_cleaned_by_name
      FROM chairs c
      LEFT JOIN users u ON c.last_cleaned_by = u.id
      WHERE c.id = ?
    `).get(id) as any | undefined;
    return row ? mapRow(row) : undefined;
  }

  updateStatus(id: number, status: Chair['status']): void {
    db.prepare('UPDATE chairs SET status = ? WHERE id = ?').run(status, id);
  }

  updateCleanInfo(id: number, cleanedBy: number, cleanedAt: string): void {
    db.prepare('UPDATE chairs SET last_cleaned_at = ?, last_cleaned_by = ? WHERE id = ?')
      .run(cleanedAt, cleanedBy, id);
  }

  findAvailableForDate(date: string, startTime: string, endTime: string): Chair[] {
    const rows = db.prepare(`
      SELECT c.*, u.name as last_cleaned_by_name
      FROM chairs c
      LEFT JOIN users u ON c.last_cleaned_by = u.id
      WHERE c.status = 'available' AND c.id NOT IN (
        SELECT chair_id FROM bookings
        WHERE date = ? AND status IN ('pending', 'checked_in')
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND start_time < ?)
        )
      )
      AND c.id NOT IN (
        SELECT chair_id FROM bookings
        WHERE date = ? AND cleanup_confirmed = 0 AND status = 'completed'
        AND end_time >= ?
      )
      ORDER BY c.chair_number
    `).all(date, endTime, startTime, startTime, endTime, date, startTime) as any[];
    return rows.map(mapRow);
  }
}

export const chairRepository = new ChairRepository();
