import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'parcel.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initSQL = `
CREATE TABLE IF NOT EXISTS lockers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL,
  size TEXT NOT NULL CHECK(size IN ('S', 'M', 'L', 'XL')),
  status TEXT NOT NULL DEFAULT 'free' CHECK(status IN ('free', 'occupied', 'disabled'))
);

CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  phone_last4 TEXT NOT NULL,
  company TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  locker_id TEXT NOT NULL,
  size TEXT NOT NULL CHECK(size IN ('S', 'M', 'L', 'XL')),
  is_cod INTEGER NOT NULL DEFAULT 0,
  is_fragile INTEGER NOT NULL DEFAULT 0,
  is_cold_chain INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'picked', 'abnormal')),
  created_at TEXT NOT NULL,
  picked_at TEXT,
  picked_by TEXT,
  is_proxy INTEGER DEFAULT 0,
  proxy_name TEXT,
  proxy_phone TEXT,
  abnormal_reason TEXT,
  FOREIGN KEY (locker_id) REFERENCES lockers(id)
);

CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_phone ON packages(phone_last4);
CREATE INDEX IF NOT EXISTS idx_packages_created ON packages(created_at);
CREATE INDEX IF NOT EXISTS idx_lockers_status ON lockers(status);
`;

db.exec(initSQL);

const lockerCount = db.prepare('SELECT COUNT(*) as cnt FROM lockers').get() as { cnt: number };
if (lockerCount.cnt === 0) {
  const insertLocker = db.prepare(
    'INSERT INTO lockers (id, code, zone, size, status) VALUES (?, ?, ?, ?, ?)'
  );
  const zones = ['A', 'B', 'C'];
  const sizes: Record<number, string> = { 1: 'S', 2: 'S', 3: 'S', 4: 'M', 5: 'M', 6: 'M', 7: 'M', 8: 'L', 9: 'L', 10: 'L', 11: 'XL', 12: 'XL' };

  const insertMany = db.transaction(() => {
    for (const zone of zones) {
      for (let i = 1; i <= 12; i++) {
        const id = `${zone}${i.toString().padStart(2, '0')}`;
        const code = `${zone}-${i.toString().padStart(2, '0')}`;
        insertLocker.run(id, code, zone, sizes[i], 'free');
      }
    }
  });
  insertMany();
}

export default db;
