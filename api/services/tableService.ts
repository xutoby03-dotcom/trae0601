import { getDb } from '../db/database.js';
import type { TableData, CreateTableRequest } from '../../shared/types.js';

function rowToTable(row: any): TableData {
  return {
    id: row.id,
    tableNumber: row.table_number,
    capacity: row.capacity,
    isWindow: Boolean(row.is_window),
    isMahjong: Boolean(row.is_mahjong),
    openTime: row.open_time,
    closeTime: row.close_time,
    photo: row.photo || undefined,
    createdAt: row.created_at,
  };
}

export function getAllTables(): TableData[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM tables ORDER BY table_number').all();
  return rows.map(rowToTable);
}

export function getTableById(id: number): TableData | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
  return row ? rowToTable(row) : undefined;
}

export function createTable(data: CreateTableRequest): TableData {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO tables (table_number, capacity, is_window, is_mahjong, open_time, close_time, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.tableNumber,
    data.capacity,
    data.isWindow ? 1 : 0,
    data.isMahjong ? 1 : 0,
    data.openTime,
    data.closeTime,
    data.photo || null
  );

  return getTableById(result.lastInsertRowid as number)!;
}

export function updateTable(id: number, data: Partial<CreateTableRequest>): TableData | undefined {
  const db = getDb();
  const existing = getTableById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...data };

  db.prepare(`
    UPDATE tables 
    SET table_number = ?, capacity = ?, is_window = ?, is_mahjong = ?, open_time = ?, close_time = ?, photo = ?
    WHERE id = ?
  `).run(
    merged.tableNumber,
    merged.capacity,
    merged.isWindow ? 1 : 0,
    merged.isMahjong ? 1 : 0,
    merged.openTime,
    merged.closeTime,
    merged.photo || null,
    id
  );

  return getTableById(id);
}

export function deleteTable(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM tables WHERE id = ?').run(id);
  return result.changes > 0;
}
