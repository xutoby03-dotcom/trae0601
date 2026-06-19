import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "uniform.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      className TEXT NOT NULL,
      name TEXT NOT NULL,
      height INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      originalSize TEXT NOT NULL,
      phone TEXT NOT NULL,
      remark TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      sizeChart TEXT NOT NULL,
      stock TEXT NOT NULL,
      price REAL NOT NULL,
      supplier TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      productId TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      isExchange INTEGER NOT NULL DEFAULT 0,
      originalSize TEXT,
      originalCondition TEXT,
      paymentStatus TEXT NOT NULL,
      orderStatus TEXT NOT NULL,
      remark TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (studentId) REFERENCES students(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      supplier TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      completedAt TEXT,
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(studentId);
    CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(productId);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(orderStatus);
    CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(productId);
    CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
  `);

  console.log("✅ Database initialized at", dbPath);
  return db;
}

export default db;
