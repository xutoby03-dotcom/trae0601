import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const CHAIRS_FILE = path.join(DATA_DIR, 'chairs.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readJSON(filePath, fallback) {
  ensureDir();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    return fallback;
  } catch (err) {
    console.error(`[DB] Read failed ${filePath}:`, err.message);
    return fallback;
  }
}

export function writeJSON(filePath, data) {
  ensureDir();
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error(`[DB] Write failed ${filePath}:`, err.message);
    return false;
  }
}

export function readChairs() {
  return readJSON(CHAIRS_FILE, []);
}

export function writeChairs(chairs) {
  return writeJSON(CHAIRS_FILE, chairs);
}

export function readOrders() {
  return readJSON(ORDERS_FILE, []);
}

export function writeOrders(orders) {
  return writeJSON(ORDERS_FILE, orders);
}

export function initializeIfEmpty(mockChairs, mockOrders) {
  if (!fs.existsSync(CHAIRS_FILE) || readChairs().length === 0) {
    writeChairs(mockChairs);
    console.log(`[DB] 已初始化 ${mockChairs.length} 条椅子数据`);
  }
  if (!fs.existsSync(ORDERS_FILE) || readOrders().length === 0) {
    writeOrders(mockOrders);
    console.log(`[DB] 已初始化 ${mockOrders.length} 条工单数据`);
  }
}
