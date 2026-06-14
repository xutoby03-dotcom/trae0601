import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/graduation.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS costumes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      size TEXT NOT NULL,
      color TEXT NOT NULL,
      accessories_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '在库',
      cleaning_status TEXT NOT NULL DEFAULT '干净',
      photo_url TEXT,
      rfid_tag TEXT,
      remark TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_costumes_type ON costumes(type);
    CREATE INDEX IF NOT EXISTS idx_costumes_size ON costumes(size);
    CREATE INDEX IF NOT EXISTS idx_costumes_status ON costumes(status);
    CREATE INDEX IF NOT EXISTS idx_costumes_cleaning_status ON costumes(cleaning_status);

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      class_name TEXT NOT NULL,
      class_contact TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      shoot_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      head_count INTEGER NOT NULL,
      size_breakdown_json TEXT NOT NULL,
      teacher_in_charge TEXT NOT NULL,
      pickup_location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '待审核',
      reject_reason TEXT,
      remark TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(shoot_date);
    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
    CREATE INDEX IF NOT EXISTS idx_reservations_class ON reservations(class_name);

    CREATE TABLE IF NOT EXISTS lending_records (
      id TEXT PRIMARY KEY,
      reservation_id TEXT NOT NULL REFERENCES reservations(id),
      lender_name TEXT NOT NULL,
      lend_date TEXT NOT NULL,
      expected_return_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_lending_records_reservation ON lending_records(reservation_id);
    CREATE INDEX IF NOT EXISTS idx_lending_records_date ON lending_records(lend_date);

    CREATE TABLE IF NOT EXISTS lending_items (
      id TEXT PRIMARY KEY,
      lending_record_id TEXT NOT NULL REFERENCES lending_records(id),
      costume_id TEXT NOT NULL REFERENCES costumes(id),
      returned BOOLEAN NOT NULL DEFAULT FALSE,
      return_date TEXT,
      accessory_check_json TEXT,
      has_stain BOOLEAN,
      damage_note TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_lending_items_record ON lending_items(lending_record_id);
    CREATE INDEX IF NOT EXISTS idx_lending_items_costume ON lending_items(costume_id);
    CREATE INDEX IF NOT EXISTS idx_lending_items_returned ON lending_items(returned);

    CREATE TABLE IF NOT EXISTS damage_records (
      id TEXT PRIMARY KEY,
      lending_record_id TEXT NOT NULL REFERENCES lending_records(id),
      costume_id TEXT NOT NULL REFERENCES costumes(id),
      missing_accessories_json TEXT NOT NULL,
      has_stain BOOLEAN NOT NULL,
      damage_description TEXT NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved BOOLEAN NOT NULL DEFAULT FALSE,
      resolved_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_damage_records_costume ON damage_records(costume_id);
    CREATE INDEX IF NOT EXISTS idx_damage_records_resolved ON damage_records(resolved);

    CREATE TABLE IF NOT EXISTS cleaning_records (
      id TEXT PRIMARY KEY,
      costume_id TEXT NOT NULL REFERENCES costumes(id),
      status TEXT NOT NULL DEFAULT '排队中',
      queued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      started_at TEXT,
      completed_at TEXT,
      operator TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_cleaning_records_status ON cleaning_records(status);
    CREATE INDEX IF NOT EXISTS idx_cleaning_records_costume ON cleaning_records(costume_id);
  `);
}

export default db;
