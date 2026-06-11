import { getDb } from '../db/database.js';
import type { StatsData } from '../../shared/types.js';

export function getStats(): StatsData {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00`;
  const endOfDay = `${today}T23:59:59`;

  const todayRow = db.prepare(`
    SELECT COUNT(*) as count FROM reservations
    WHERE start_time >= ? AND start_time <= ?
  `).get(startOfDay, endOfDay) as { count: number };

  const todayReservations = todayRow.count;

  const checkedInRow = db.prepare(`
    SELECT COUNT(*) as count FROM reservations
    WHERE start_time >= ? AND start_time <= ?
      AND status IN ('checked_in', 'completed')
  `).get(startOfDay, endOfDay) as { count: number };

  const checkInRate = todayReservations > 0 
    ? Math.round((checkedInRow.count / todayReservations) * 100) 
    : 0;

  const noShowRow = db.prepare(`
    SELECT COUNT(*) as count FROM reservations
    WHERE start_time >= ? AND start_time <= ?
      AND status = 'no_show'
  `).get(startOfDay, endOfDay) as { count: number };

  const noShowCount = noShowRow.count;

  const peakHours = getPeakHours();
  const popularTables = getPopularTables();
  const noShowRecords = getNoShowRecords();

  return {
    todayReservations,
    checkInRate,
    noShowCount,
    peakHours,
    popularTables,
    noShowRecords,
  };
}

function getPeakHours(): { hour: number; count: number }[] {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00`;
  const endOfDay = `${today}T23:59:59`;

  const rows = db.prepare(`
    SELECT CAST(strftime('%H', start_time) AS INTEGER) as hour, COUNT(*) as count
    FROM reservations
    WHERE start_time >= ? AND start_time <= ?
      AND status NOT IN ('cancelled')
    GROUP BY hour
    ORDER BY hour
  `).all(startOfDay, endOfDay) as { hour: number; count: number }[];

  const result: { hour: number; count: number }[] = [];
  for (let h = 8; h <= 22; h++) {
    const found = rows.find(r => r.hour === h);
    result.push({ hour: h, count: found ? found.count : 0 });
  }

  return result;
}

function getPopularTables(): { tableId: number; tableNumber: string; count: number }[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT t.id as table_id, t.table_number, COUNT(r.id) as count
    FROM tables t
    LEFT JOIN reservations r ON t.id = r.table_id
      AND r.status NOT IN ('cancelled')
    GROUP BY t.id
    ORDER BY count DESC, t.table_number
    LIMIT 10
  `).all() as { table_id: number; table_number: string; count: number }[];

  return rows.map(r => ({
    tableId: r.table_id,
    tableNumber: r.table_number,
    count: r.count,
  }));
}

function getNoShowRecords(): { name: string; phone: string; count: number }[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT contact_name, contact_phone, COUNT(*) as count
    FROM reservations
    WHERE status = 'no_show'
    GROUP BY contact_phone
    ORDER BY count DESC
    LIMIT 10
  `).all() as { contact_name: string; contact_phone: string; count: number }[];

  return rows.map(r => ({
    name: r.contact_name,
    phone: r.contact_phone,
    count: r.count,
  }));
}
