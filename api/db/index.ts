import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room TEXT NOT NULL,
      bed_number TEXT NOT NULL,
      bunk_type TEXT NOT NULL CHECK (bunk_type IN ('upper', 'lower')),
      is_window_side INTEGER NOT NULL DEFAULT 0,
      disinfection_status TEXT NOT NULL DEFAULT 'pending' CHECK (disinfection_status IN ('completed', 'pending', 'expired')),
      disinfection_date TEXT,
      photo_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(room, bed_number)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bed_id INTEGER NOT NULL,
      class_name TEXT NOT NULL,
      student_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL DEFAULT 'full' CHECK (time_slot IN ('morning', 'afternoon', 'full')),
      allergy_note TEXT DEFAULT '',
      parent_confirmed INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'absent', 'swapped')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (bed_id) REFERENCES beds(id),
      UNIQUE(bed_id, date, time_slot)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL UNIQUE,
      check_in_time TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'absent')),
      FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    );

    CREATE TABLE IF NOT EXISTS bed_swaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      from_bed_id INTEGER NOT NULL,
      to_bed_id INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reservation_id) REFERENCES reservations(id),
      FOREIGN KEY (from_bed_id) REFERENCES beds(id),
      FOREIGN KEY (to_bed_id) REFERENCES beds(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
    CREATE INDEX IF NOT EXISTS idx_reservations_class ON reservations(class_name);
    CREATE INDEX IF NOT EXISTS idx_beds_disinfection ON beds(disinfection_status);
  `);

  seedData();
}

function seedData() {
  const bedCount = db.prepare('SELECT COUNT(*) as count FROM beds').get() as { count: number };
  if (bedCount.count > 0) return;

  const rooms = ['101', '102', '201', '202'];
  const insertBed = db.prepare(`
    INSERT INTO beds (room, bed_number, bunk_type, is_window_side, disinfection_status, disinfection_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().split('T')[0];

  rooms.forEach((room) => {
    for (let i = 1; i <= 6; i++) {
      const isWindowSide = i <= 2 ? 1 : 0;
      const bunkType = i % 2 === 1 ? 'lower' : 'upper';
      const status = i % 3 === 0 ? 'pending' : 'completed';
      insertBed.run(room, String(i), bunkType, isWindowSide, status, status === 'completed' ? today : null);
    }
  });

  const classes = ['一(1)班', '一(2)班', '一(3)班', '二(1)班', '二(2)班'];
  const names = ['小明', '小红', '小刚', '小丽', '小华', '小芳', '小强', '小梅'];
  const insertReservation = db.prepare(`
    INSERT INTO reservations (bed_id, class_name, student_name, date, time_slot, allergy_note, parent_confirmed, status)
    VALUES (?, ?, ?, ?, 'full', ?, 1, 'pending')
  `);
  const insertCheckIn = db.prepare(`
    INSERT INTO check_ins (reservation_id, status) VALUES (?, 'pending')
  `);

  const beds = db.prepare('SELECT id FROM beds WHERE disinfection_status = ?').all('completed') as Array<{ id: number }>;

  for (let i = 0; i < 10 && i < beds.length; i++) {
    const className = classes[i % classes.length];
    const studentName = names[i % names.length];
    const allergy = i % 4 === 0 ? '对牛奶过敏' : '';
    const result = insertReservation.run(beds[i].id, className, studentName, today, allergy);
    insertCheckIn.run(result.lastInsertRowid);
  }
}
