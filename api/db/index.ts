import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/app.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key_number TEXT NOT NULL UNIQUE,
      available_time TEXT NOT NULL,
      deposit REAL NOT NULL DEFAULT 0,
      manager TEXT NOT NULL,
      door_photo TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      activity_name TEXT NOT NULL,
      borrower_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      deposit_status TEXT NOT NULL DEFAULT 'unpaid',
      status TEXT NOT NULL DEFAULT 'borrowed',
      return_checklist TEXT,
      returned_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS exceptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrow_id INTEGER,
      room_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      measure TEXT,
      compensation REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (borrow_id) REFERENCES borrows(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );

    CREATE INDEX IF NOT EXISTS idx_borrows_room_id ON borrows(room_id);
    CREATE INDEX IF NOT EXISTS idx_borrows_status ON borrows(status);
    CREATE INDEX IF NOT EXISTS idx_exceptions_room_id ON exceptions(room_id);
    CREATE INDEX IF NOT EXISTS idx_exceptions_borrow_id ON exceptions(borrow_id);
  `);

  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (roomCount.count === 0) {
    const insertRoom = db.prepare(`
      INSERT INTO rooms (name, key_number, available_time, deposit, manager, door_photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const rooms = [
      ['多功能活动室', 'KEY-001', '08:00-21:00', 100, '张管理员', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=community%20activity%20room%20door%20with%20sign&image_size=square'],
      ['合唱室', 'KEY-002', '09:00-20:00', 50, '李管理员', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=choir%20room%20door%20with%20music%20notes%20sign&image_size=square'],
      ['书法教室', 'KEY-003', '08:30-18:30', 80, '王管理员', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=calligraphy%20classroom%20door%20with%20chinese%20brush%20sign&image_size=square'],
    ];

    const insertMany = db.transaction((roomList: unknown[][]) => {
      for (const room of roomList) {
        insertRoom.run(...room);
      }
    });

    insertMany(rooms as unknown[][]);

    const insertBorrow = db.prepare(`
      INSERT INTO borrows (room_id, activity_name, borrower_name, phone, start_time, end_time, deposit_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const borrows = [
      [1, '社区合唱排练', '陈阿姨', '13800138001', now.toISOString(), tomorrow.toISOString(), 'paid', 'borrowed'],
      [2, '书法培训班', '刘大爷', '13900139002', dayBefore.toISOString(), yesterday.toISOString(), 'paid', 'borrowed'],
      [3, '老年大学课程', '赵老师', '13700137003', dayBefore.toISOString(), yesterday.toISOString(), 'unpaid', 'borrowed'],
    ];

    const insertBorrows = db.transaction((borrowList: unknown[][]) => {
      for (const borrow of borrowList) {
        insertBorrow.run(...borrow);
      }
    });

    insertBorrows(borrows);
  }
}
