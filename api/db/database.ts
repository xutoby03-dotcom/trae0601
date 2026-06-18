import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { seedMockData } from './mockData.js';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'pet-boarding.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'reception', 'caregiver')),
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      species VARCHAR(20) NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
      breed VARCHAR(100) NOT NULL,
      age INTEGER NOT NULL,
      weight REAL NOT NULL,
      personality VARCHAR(255),
      sterilized BOOLEAN DEFAULT 0,
      owner_name VARCHAR(100) NOT NULL,
      owner_phone VARCHAR(20) NOT NULL,
      photo_url VARCHAR(500),
      medical_history TEXT,
      allergies TEXT,
      special_requirements TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_pets_name ON pets(name);
    CREATE INDEX IF NOT EXISTS idx_pets_owner_phone ON pets(owner_phone);
    CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);

    CREATE TABLE IF NOT EXISTS vaccine_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      type VARCHAR(30) NOT NULL CHECK (type IN ('rabies', 'cat-triple', 'dog-quad', 'deworming', 'other')),
      name VARCHAR(100) NOT NULL,
      vaccination_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      certificate_url VARCHAR(500),
      status VARCHAR(20) NOT NULL CHECK (status IN ('valid', 'expiring', 'expired')),
      verified BOOLEAN DEFAULT 0,
      verified_by INTEGER,
      verified_at DATETIME,
      notes TEXT,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_vaccine_pet_id ON vaccine_records(pet_id);
    CREATE INDEX IF NOT EXISTS idx_vaccine_status ON vaccine_records(status);
    CREATE INDEX IF NOT EXISTS idx_vaccine_expiry ON vaccine_records(expiry_date);

    CREATE TABLE IF NOT EXISTS cages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('normal', 'isolation')),
      suitable_for VARCHAR(20) NOT NULL CHECK (suitable_for IN ('dog', 'cat', 'both')),
      size VARCHAR(20) NOT NULL CHECK (size IN ('small', 'medium', 'large')),
      status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
      current_stay_id INTEGER,
      notes TEXT,
      FOREIGN KEY (current_stay_id) REFERENCES stays(id)
    );

    CREATE INDEX IF NOT EXISTS idx_cages_status ON cages(status);
    CREATE INDEX IF NOT EXISTS idx_cages_type ON cages(type);

    CREATE TABLE IF NOT EXISTS stays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      cage_id INTEGER,
      check_in_date DATE NOT NULL,
      check_out_date DATE,
      actual_check_out DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
      vaccination_verified BOOLEAN DEFAULT 0,
      requires_isolation BOOLEAN DEFAULT 0,
      high_risk BOOLEAN DEFAULT 0,
      high_risk_reason TEXT,
      assigned_staff_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
      FOREIGN KEY (cage_id) REFERENCES cages(id),
      FOREIGN KEY (assigned_staff_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_stays_pet_id ON stays(pet_id);
    CREATE INDEX IF NOT EXISTS idx_stays_status ON stays(status);
    CREATE INDEX IF NOT EXISTS idx_stays_checkin ON stays(check_in_date);
    CREATE INDEX IF NOT EXISTS idx_stays_high_risk ON stays(high_risk);

    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stay_id INTEGER NOT NULL,
      record_date DATE NOT NULL,
      feeding TEXT NOT NULL,
      defecation VARCHAR(20) NOT NULL CHECK (defecation IN ('normal', 'soft', 'diarrhea', 'constipation', 'none')),
      defecation_count INTEGER DEFAULT 0,
      mental_state VARCHAR(20) NOT NULL CHECK (mental_state IN ('excellent', 'good', 'fair', 'poor')),
      water_intake VARCHAR(255),
      exercise VARCHAR(255),
      abnormal BOOLEAN DEFAULT 0,
      abnormal_description TEXT,
      abnormal_photos TEXT,
      handling_measures TEXT,
      recorded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stay_id) REFERENCES stays(id) ON DELETE CASCADE,
      FOREIGN KEY (recorded_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_daily_records_stay_id ON daily_records(stay_id);
    CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(record_date);
    CREATE INDEX IF NOT EXISTS idx_daily_records_abnormal ON daily_records(abnormal);
  `;

  db.exec(createTables);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const insertUsers = db.prepare(`
      INSERT INTO users (username, name, role, phone, password_hash) VALUES 
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?)
    `);
    insertUsers.run(
      'admin', '系统管理员', 'admin', '13800000000', passwordHash,
      'reception', '前台小王', 'reception', '13800000001', passwordHash,
      'caregiver', '护理员小李', 'caregiver', '13800000002', passwordHash
    );
  }

  const cageCount = db.prepare('SELECT COUNT(*) as count FROM cages').get() as { count: number };
  if (cageCount.count === 0) {
    const insertCages = db.prepare(`
      INSERT INTO cages (code, name, type, suitable_for, size, status) VALUES 
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?)
    `);
    insertCages.run(
      'C001', '普通笼位1号', 'normal', 'dog', 'small', 'available',
      'C002', '普通笼位2号', 'normal', 'dog', 'medium', 'available',
      'C003', '普通笼位3号', 'normal', 'dog', 'large', 'available',
      'C004', '普通笼位4号', 'normal', 'cat', 'small', 'available',
      'C005', '普通笼位5号', 'normal', 'cat', 'medium', 'available',
      'C006', '普通笼位6号', 'normal', 'both', 'medium', 'available',
      'I001', '隔离笼位1号', 'isolation', 'dog', 'medium', 'available',
      'I002', '隔离笼位2号', 'isolation', 'cat', 'small', 'available',
      'I003', '隔离笼位3号', 'isolation', 'both', 'large', 'available'
    );
  }

  console.log('Database initialized successfully');
  
  seedMockData();
}

export default db;
