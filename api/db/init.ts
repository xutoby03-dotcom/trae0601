import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/costume.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrateDatabase() {
  try {
    const columns = db.pragma("table_info(borrow_records)") as { name: string }[];
    const colNames = columns.map(c => c.name);

    if (!colNames.includes("club_leader_name")) {
      db.exec("ALTER TABLE borrow_records ADD COLUMN club_leader_name TEXT");
    }
    if (!colNames.includes("club_leader_contact")) {
      db.exec("ALTER TABLE borrow_records ADD COLUMN club_leader_contact TEXT");
    }
    if (!colNames.includes("reminder_sent")) {
      db.exec("ALTER TABLE borrow_records ADD COLUMN reminder_sent INTEGER NOT NULL DEFAULT 0");
    }
    if (!colNames.includes("reminder_at")) {
      db.exec("ALTER TABLE borrow_records ADD COLUMN reminder_at TEXT");
    }
  } catch (e) {
    console.log("Migration skipped:", (e as Error).message);
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS costumes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      size TEXT NOT NULL,
      program TEXT,
      photo_url TEXT,
      wash_status TEXT NOT NULL DEFAULT 'clean',
      status TEXT NOT NULL DEFAULT 'available',
      use_count INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accessory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      costume_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      category TEXT NOT NULL,
      FOREIGN KEY (costume_id) REFERENCES costumes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      leader_name TEXT,
      contact TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      student_id TEXT UNIQUE,
      club_name TEXT,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrow_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      costume_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      club_name TEXT NOT NULL,
      activity_name TEXT,
      borrow_date TEXT NOT NULL,
      expected_return_date TEXT NOT NULL,
      actual_return_date TEXT,
      deposit REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'borrowed',
      notes TEXT,
      club_leader_name TEXT,
      club_leader_contact TEXT,
      reminder_sent INTEGER NOT NULL DEFAULT 0,
      reminder_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (costume_id) REFERENCES costumes(id)
    );

    CREATE TABLE IF NOT EXISTS return_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrow_record_id INTEGER NOT NULL UNIQUE,
      clothes_ok INTEGER NOT NULL DEFAULT 0,
      headdress_ok INTEGER NOT NULL DEFAULT 0,
      belt_ok INTEGER NOT NULL DEFAULT 0,
      shoe_cover_ok INTEGER NOT NULL DEFAULT 0,
      clean_ok INTEGER NOT NULL DEFAULT 0,
      has_stain INTEGER NOT NULL DEFAULT 0,
      has_damage INTEGER NOT NULL DEFAULT 0,
      issues TEXT,
      can_stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id)
    );

    CREATE INDEX IF NOT EXISTS idx_costumes_status ON costumes(status);
    CREATE INDEX IF NOT EXISTS idx_costumes_wash_status ON costumes(wash_status);
    CREATE INDEX IF NOT EXISTS idx_borrow_records_status ON borrow_records(status);
    CREATE INDEX IF NOT EXISTS idx_borrow_records_costume ON borrow_records(costume_id);
    CREATE INDEX IF NOT EXISTS idx_borrow_records_club ON borrow_records(club_name);
    CREATE INDEX IF NOT EXISTS idx_accessory_items_costume ON accessory_items(costume_id);
  `);

  migrateDatabase();
  seedInitialData();
}

function seedInitialData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM costumes').get() as { count: number };
  if (count.count > 0) return;

  const costumes = [
    { id: 'COST-001', name: '古典舞水袖服', size: 'M', program: '《惊鸿舞》', wash_status: 'clean', status: 'available', use_count: 12 },
    { id: 'COST-002', name: '古典舞水袖服', size: 'L', program: '《惊鸿舞》', wash_status: 'clean', status: 'borrowed', use_count: 8 },
    { id: 'COST-003', name: '现代舞练功服', size: 'S', program: '《青春律动》', wash_status: 'dirty', status: 'washing', use_count: 15 },
    { id: 'COST-004', name: '民族舞藏族服', size: 'M', program: '《天路》', wash_status: 'clean', status: 'available', use_count: 6 },
    { id: 'COST-005', name: '民族舞藏族服', size: 'L', program: '《天路》', wash_status: 'clean', status: 'available', use_count: 9 },
    { id: 'COST-006', name: '爵士舞亮片服', size: 'M', program: '《热力节拍》', wash_status: 'dirty', status: 'pending', use_count: 20 },
    { id: 'COST-007', name: '芭蕾舞裙', size: 'S', program: '《天鹅湖》选段', wash_status: 'clean', status: 'available', use_count: 11 },
    { id: 'COST-008', name: '街舞套装', size: 'L', program: '《街头潮流》', wash_status: 'clean', status: 'borrowed', use_count: 18 },
  ];

  const insertCostume = db.prepare(`
    INSERT INTO costumes (id, name, size, program, photo_url, wash_status, status, use_count)
    VALUES (@id, @name, @size, @program, @photo_url, @wash_status, @status, @use_count)
  `);

  const insertAccessory = db.prepare(`
    INSERT INTO accessory_items (costume_id, name, quantity, category)
    VALUES (@costume_id, @name, @quantity, @category)
  `);

  const accessories: { costume_id: string; name: string; quantity: number; category: string }[] = [
    { costume_id: 'COST-001', name: '水袖上衣', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-001', name: '长裙', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-001', name: '发簪头饰', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-001', name: '绣花腰带', quantity: 1, category: 'belt' },
    { costume_id: 'COST-002', name: '水袖上衣', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-002', name: '长裙', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-002', name: '发簪头饰', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-002', name: '绣花腰带', quantity: 1, category: 'belt' },
    { costume_id: 'COST-003', name: '练功上衣', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-003', name: '练功裤', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-003', name: '软底鞋套', quantity: 1, category: 'shoe_cover' },
    { costume_id: 'COST-004', name: '藏袍', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-004', name: '头饰', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-004', name: '腰带', quantity: 1, category: 'belt' },
    { costume_id: 'COST-004', name: '藏靴套', quantity: 1, category: 'shoe_cover' },
    { costume_id: 'COST-005', name: '藏袍', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-005', name: '头饰', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-005', name: '腰带', quantity: 1, category: 'belt' },
    { costume_id: 'COST-005', name: '藏靴套', quantity: 1, category: 'shoe_cover' },
    { costume_id: 'COST-006', name: '亮片上衣', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-006', name: '亮片短裤', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-006', name: '亮片帽子', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-006', name: '亮片腰带', quantity: 1, category: 'belt' },
    { costume_id: 'COST-007', name: '芭蕾舞裙', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-007', name: '芭蕾舞头饰', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-007', name: '足尖鞋套', quantity: 1, category: 'shoe_cover' },
    { costume_id: 'COST-008', name: '街舞卫衣', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-008', name: '街舞裤', quantity: 1, category: 'clothes' },
    { costume_id: 'COST-008', name: '棒球帽', quantity: 1, category: 'headdress' },
    { costume_id: 'COST-008', name: '腰链', quantity: 1, category: 'belt' },
  ];

  const tx = db.transaction(() => {
    for (const costume of costumes) {
      insertCostume.run({
        ...costume,
        photo_url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(costume.name + ' 演出服 白色背景 产品摄影')}&image_size=square`,
      });
    }
    for (const acc of accessories) {
      insertAccessory.run(acc);
    }
  });

  tx();

  const clubs = ['舞蹈社', '话剧社', '音乐社', '模特社'];
  const insertClub = db.prepare('INSERT OR IGNORE INTO clubs (name) VALUES (?)');
  for (const club of clubs) {
    insertClub.run(club);
  }

  const today = new Date();
  const borrowRecords = [
    {
      costume_id: 'COST-002',
      student_name: '张小涵',
      club_name: '舞蹈社',
      activity_name: '迎新晚会彩排',
      borrow_date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expected_return_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deposit: 200,
      status: 'overdue',
      club_leader_name: '王美琪',
      club_leader_contact: '13800138001',
      reminder_sent: 0,
    },
    {
      costume_id: 'COST-008',
      student_name: '李明辉',
      club_name: '街舞协会',
      activity_name: '校园文化节',
      borrow_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expected_return_date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deposit: 300,
      status: 'borrowed',
      club_leader_name: '陈浩然',
      club_leader_contact: '13900139002',
      reminder_sent: 0,
    },
  ];

  const insertBorrow = db.prepare(`
    INSERT INTO borrow_records (costume_id, student_name, club_name, activity_name, borrow_date, expected_return_date, deposit, status, club_leader_name, club_leader_contact, reminder_sent)
    VALUES (@costume_id, @student_name, @club_name, @activity_name, @borrow_date, @expected_return_date, @deposit, @status, @club_leader_name, @club_leader_contact, @reminder_sent)
  `);

  for (const record of borrowRecords) {
    insertBorrow.run(record);
  }
}
