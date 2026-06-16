import { db } from '../db/connection';
import { DamageRecord, DamagePartStats } from '../../shared/types';

function mapRow(row: any): DamageRecord {
  return {
    id: row.id,
    chairId: row.chair_id,
    chairNumber: row.chair_number,
    bookingId: row.booking_id,
    reportedBy: row.reported_by,
    reporterName: row.reporter_name,
    partName: row.part_name,
    description: row.description,
    reportedAt: row.reported_at,
    status: row.status,
  };
}

export class DamageRepository {
  create(data: {
    chairId: number;
    bookingId?: number;
    reportedBy: number;
    partName: string;
    description?: string;
  }): number {
    const result = db.prepare(`
      INSERT INTO damage_records (chair_id, booking_id, reported_by, part_name, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.chairId, data.bookingId || null, data.reportedBy, data.partName, data.description || null);
    return result.lastInsertRowid as number;
  }

  findByChairId(chairId: number): DamageRecord[] {
    const rows = db.prepare(`
      SELECT d.*, c.chair_number, u.name as reporter_name
      FROM damage_records d
      JOIN chairs c ON d.chair_id = c.id
      JOIN users u ON d.reported_by = u.id
      WHERE d.chair_id = ?
      ORDER BY d.reported_at DESC
    `).all(chairId) as any[];
    return rows.map(mapRow);
  }

  getPartStats(): DamagePartStats[] {
    return db.prepare(`
      SELECT part_name as partName, COUNT(*) as count
      FROM damage_records
      GROUP BY part_name
      ORDER BY count DESC
      LIMIT 10
    `).all() as DamagePartStats[];
  }

  updateStatus(id: number, status: 'reported' | 'repaired'): void {
    db.prepare('UPDATE damage_records SET status = ? WHERE id = ?').run(status, id);
  }
}

export const damageRepository = new DamageRepository();
