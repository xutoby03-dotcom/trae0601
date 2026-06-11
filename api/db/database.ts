import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'data', 'chess.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      is_window INTEGER DEFAULT 0,
      is_mahjong INTEGER DEFAULT 0,
      open_time TEXT NOT NULL DEFAULT '08:00',
      close_time TEXT NOT NULL DEFAULT '22:00',
      photo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      game_type TEXT NOT NULL,
      people_count INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      tea_requirement TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      checked_in_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations(table_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_start_time ON reservations(start_time);
    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
  `);

  const tableCount = database.prepare('SELECT COUNT(*) as count FROM tables').get() as { count: number };
  if (tableCount.count === 0) {
    const insert = database.prepare(`
      INSERT INTO tables (table_number, capacity, is_window, is_mahjong, open_time, close_time, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const tables = [
      ['A01', 4, 1, 1, '08:00', '22:00', 'https://images.unsplash.com/photo-1612896018708-7f0836ffcdf4?w=200&h=200&fit=crop'],
      ['A02', 4, 1, 1, '08:00', '22:00', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200&h=200&fit=crop'],
      ['A03', 4, 0, 1, '08:00', '22:00', 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=200&h=200&fit=crop'],
      ['B01', 6, 1, 0, '09:00', '21:00', 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=200&h=200&fit=crop'],
      ['B02', 2, 0, 0, '08:00', '22:00', null],
      ['C01', 4, 1, 0, '08:00', '22:00', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=200&h=200&fit=crop'],
      ['C02', 8, 0, 0, '10:00', '20:00', null],
    ];

    for (const t of tables) {
      insert.run(...t);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const insertRes = database.prepare(`
      INSERT INTO reservations (table_id, game_type, people_count, start_time, end_time, contact_name, contact_phone, tea_requirement, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleReservations = [
      [1, '麻将', 4, `${todayStr}T09:00:00`, `${todayStr}T11:00:00`, '张大爷', '13800138001', '菊花茶', 'checked_in'],
      [1, '麻将', 4, `${todayStr}T14:00:00`, `${todayStr}T17:00:00`, '李阿姨', '13800138002', '绿茶', 'pending'],
      [2, '麻将', 3, `${todayStr}T10:00:00`, `${todayStr}T12:00:00`, '王大伯', '13800138003', '红茶', 'pending'],
      [3, '麻将', 4, `${todayStr}T15:00:00`, `${todayStr}T18:00:00`, '赵奶奶', '13800138004', '不喝茶', 'pending'],
      [4, '扑克', 5, `${todayStr}T13:00:00`, `${todayStr}T16:00:00`, '钱叔叔', '13800138005', '龙井茶', 'pending'],
      [5, '象棋', 2, `${todayStr}T08:30:00`, `${todayStr}T10:30:00`, '孙爷爷', '13800138006', '白开水', 'completed'],
      [6, '扑克', 4, `${todayStr}T19:00:00`, `${todayStr}T21:00:00`, '周阿姨', '13800138007', '普洱茶', 'pending'],
    ];

    for (const r of sampleReservations) {
      insertRes.run(...r);
    }
  }
}
