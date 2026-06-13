import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data.db');
const migrationsDir = path.join(__dirname, '..', '..', 'migrations');

let db: Database.Database;

export function initDatabase() {
  const isNewDatabase = !fs.existsSync(dbPath);
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  if (isNewDatabase) {
    runMigrations();
  }
  
  return db;
}

function runMigrations() {
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    db.exec(sql);
    console.log(`Migration ${file} executed successfully`);
  }
}

export function getDb(): Database.Database {
  if (!db) {
    initDatabase();
  }
  return db;
}

export function rowToPrinter(row: any) {
  return {
    id: row.id,
    location: row.location,
    printerModel: row.printer_model,
    paperSpec: row.paper_spec,
    minStock: row.min_stock,
    currentStock: row.current_stock,
    manager: row.manager,
    managerPhone: row.manager_phone,
    photoUrl: row.photo_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToConsumption(row: any) {
  return {
    id: row.id,
    printerId: row.printer_id,
    printerLocation: row.printer_location,
    department: row.department,
    quantity: row.quantity,
    purpose: row.purpose,
    receiver: row.receiver,
    isAbnormal: Boolean(row.is_abnormal),
    createdAt: row.created_at,
  };
}

export function rowToReplenishment(row: any) {
  return {
    id: row.id,
    printerId: row.printer_id,
    printerLocation: row.printer_location,
    supplier: row.supplier,
    boxCount: row.box_count,
    unitPrice: parseFloat(row.unit_price),
    totalAmount: parseFloat(row.total_amount),
    photoUrl: row.photo_url || '',
    createdAt: row.created_at,
  };
}

export function rowToAlert(row: any) {
  return {
    id: row.id,
    printerId: row.printer_id,
    printerLocation: row.printer_location,
    type: row.type,
    level: row.level,
    message: row.message,
    isResolved: Boolean(row.is_resolved),
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}
