import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/app.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS masters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS molds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT NOT NULL,
      material TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      available_quantity INTEGER NOT NULL DEFAULT 1,
      applicable_products TEXT,
      purchase_date DATE,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_molds_type ON molds(type);
    CREATE INDEX IF NOT EXISTS idx_molds_status ON molds(status);

    CREATE TABLE IF NOT EXISTS borrow_records (
      id TEXT PRIMARY KEY,
      mold_id TEXT NOT NULL,
      master_id TEXT NOT NULL,
      order_no TEXT NOT NULL,
      expected_return_date DATE NOT NULL,
      need_release_paper BOOLEAN NOT NULL DEFAULT 0,
      actual_return_date DATE,
      status TEXT NOT NULL DEFAULT 'borrowed',
      borrow_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mold_id) REFERENCES molds(id),
      FOREIGN KEY (master_id) REFERENCES masters(id)
    );

    CREATE INDEX IF NOT EXISTS idx_borrow_mold ON borrow_records(mold_id);
    CREATE INDEX IF NOT EXISTS idx_borrow_master ON borrow_records(master_id);
    CREATE INDEX IF NOT EXISTS idx_borrow_status ON borrow_records(status);
    CREATE INDEX IF NOT EXISTS idx_borrow_expected ON borrow_records(expected_return_date);

    CREATE TABLE IF NOT EXISTS return_inspections (
      id TEXT PRIMARY KEY,
      borrow_record_id TEXT NOT NULL,
      has_deformation BOOLEAN NOT NULL DEFAULT 0,
      has_coating_loss BOOLEAN NOT NULL DEFAULT 0,
      has_oil_residue BOOLEAN NOT NULL DEFAULT 0,
      has_missing_parts BOOLEAN NOT NULL DEFAULT 0,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id)
    );

    CREATE TABLE IF NOT EXISTS exception_records (
      id TEXT PRIMARY KEY,
      mold_id TEXT NOT NULL,
      borrow_record_id TEXT,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      handler_id TEXT,
      handle_method TEXT,
      handle_remark TEXT,
      handled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mold_id) REFERENCES molds(id),
      FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id)
    );

    CREATE INDEX IF NOT EXISTS idx_exception_mold ON exception_records(mold_id);
    CREATE INDEX IF NOT EXISTS idx_exception_status ON exception_records(status);
  `);

  const masterCount = database.prepare('SELECT COUNT(*) as count FROM masters').get() as { count: number };
  if (masterCount.count === 0) {
    const insertMaster = database.prepare(
      'INSERT INTO masters (id, name, phone) VALUES (?, ?, ?)'
    );
    insertMaster.run('m1', '李师傅', '13800138001');
    insertMaster.run('m2', '王师傅', '13800138002');
    insertMaster.run('m3', '张师傅', '13800138003');
  }

  const moldCount = database.prepare('SELECT COUNT(*) as count FROM molds').get() as { count: number };
  if (moldCount.count === 0) {
    const insertMold = database.prepare(
      'INSERT INTO molds (id, name, type, size, material, quantity, available_quantity, applicable_products, purchase_date, status, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertMold.run(
      'mol1', '450g吐司盒', 'toast_box', '450g', 'non_stick', 5, 3,
      '北海道吐司、白吐司、奶香吐司', '2024-01-15', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=450g%20non-stick%20toast%20box%20baking%20mold%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol2', '250g吐司盒', 'toast_box', '250g', 'non_stick', 4, 4,
      '小吐司、餐包、迷你吐司', '2024-02-20', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=250g%20small%20non-stick%20toast%20box%20baking%20mold%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol3', '12cm慕斯圈', 'mousse_ring', '12cm', 'stainless_steel', 6, 6,
      '慕斯蛋糕、芝士蛋糕、提拉米苏', '2024-03-10', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=12cm%20stainless%20steel%20mousse%20ring%20cake%20mold%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol4', '8寸圆形模', 'pound_cake', '8寸', 'aluminum', 3, 2,
      '磅蛋糕、水果蛋糕、戚风蛋糕', '2024-01-05', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=8%20inch%20round%20aluminum%20pound%20cake%20baking%20pan%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol5', '6寸心形模', 'pound_cake', '6寸', 'non_stick', 2, 2,
      '心形蛋糕、情人节专款、纪念日蛋糕', '2024-02-14', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=6%20inch%20heart%20shaped%20non-stick%20cake%20mold%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol6', '15cm慕斯圈', 'mousse_ring', '15cm', 'stainless_steel', 4, 4,
      '大型慕斯、生日蛋糕、派对蛋糕', '2024-03-15', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=15cm%20stainless%20steel%20round%20cake%20ring%20mold%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol7', '900g吐司盒', 'toast_box', '900g', 'aluminum', 2, 2,
      '大吐司、全麦面包、黑麦面包', '2024-04-01', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=900g%20large%20aluminum%20loaf%20pan%20bread%20mold%20on%20white%20background&image_size=square'
    );
    insertMold.run(
      'mol8', '方形蛋糕模', 'pound_cake', '8寸方', 'non_stick', 3, 3,
      '古早蛋糕、海绵蛋糕、方形慕斯', '2024-04-10', 'available',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=8%20inch%20square%20non-stick%20cake%20baking%20pan%20on%20white%20background&image_size=square'
    );
  }

  const borrowCount = database.prepare('SELECT COUNT(*) as count FROM borrow_records').get() as { count: number };
  if (borrowCount.count === 0) {
    const insertBorrow = database.prepare(
      'INSERT INTO borrow_records (id, mold_id, master_id, order_no, expected_return_date, need_release_paper, borrow_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertBorrow.run('b1', 'mol1', 'm1', 'ORD202406001', '2024-06-20', 1, '2024-06-18', 'borrowed');
    insertBorrow.run('b2', 'mol1', 'm2', 'ORD202406002', '2024-06-21', 0, '2024-06-18', 'borrowed');
    insertBorrow.run('b3', 'mol4', 'm3', 'ORD202406003', '2024-06-15', 1, '2024-06-12', 'overdue');
  }
}

export default getDb;
