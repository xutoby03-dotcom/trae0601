import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'elevator.db');

let db: Database.Database;

function initDatabase() {
  const dbExists = fs.existsSync(dbPath);
  db = new Database(dbPath);
  
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  if (!dbExists) {
    const migrationPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    db.exec(migrationSQL);
    console.log('Database initialized with schema and seed data');
  }
  
  return db;
}

export const getDb = () => {
  if (!db) {
    db = initDatabase();
  }
  return db;
};

export const runQuery = <T = unknown>(sql: string, params: unknown[] = []): T[] => {
  const database = getDb();
  const stmt = database.prepare(sql);
  return stmt.all(...params) as T[];
};

export const runOne = <T = unknown>(sql: string, params: unknown[] = []): T | undefined => {
  const database = getDb();
  const stmt = database.prepare(sql);
  return stmt.get(...params) as T | undefined;
};

export const runExecute = (sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: bigint | number } => {
  const database = getDb();
  const stmt = database.prepare(sql);
  return stmt.run(...params);
};

export const runTransaction = (fn: () => void) => {
  const database = getDb();
  const transaction = database.transaction(fn);
  return transaction();
};

export { db };
