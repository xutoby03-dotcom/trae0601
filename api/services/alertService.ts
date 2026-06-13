import { v4 as uuidv4 } from 'uuid';
import { getDb, rowToAlert } from '../data/database';
import { getPrinterById } from './printerService';
import type { Alert, AlertLevel, AlertType } from '../../shared/types';

const ABNORMAL_THRESHOLD = 5;
const ABNORMAL_DAILY_AVERAGE_THRESHOLD = 3;

export function getAllAlerts(printerId?: string, isResolved?: boolean): Alert[] {
  const db = getDb();
  let query = `
    SELECT a.*, p.location as printer_location
    FROM alerts a
    LEFT JOIN printers p ON a.printer_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (printerId) {
    query += ' AND a.printer_id = ?';
    params.push(printerId);
  }
  if (isResolved !== undefined) {
    query += ' AND a.is_resolved = ?';
    params.push(isResolved ? 1 : 0);
  }
  
  query += ' ORDER BY a.created_at DESC';
  
  const rows = db.prepare(query).all(...params);
  return rows.map(rowToAlert);
}

export function getAlertById(id: string): Alert | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT a.*, p.location as printer_location
    FROM alerts a
    LEFT JOIN printers p ON a.printer_id = p.id
    WHERE a.id = ?
  `).get(id);
  return row ? rowToAlert(row) : null;
}

export function createAlert(
  printerId: string,
  type: AlertType,
  level: AlertLevel,
  message: string
): Alert {
  const db = getDb();
  
  const existingAlert = db.prepare(`
    SELECT * FROM alerts 
    WHERE printer_id = ? AND type = ? AND is_resolved = 0
  `).get(printerId, type);
  
  if (existingAlert) {
    return rowToAlert(existingAlert);
  }
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO alerts (id, printer_id, type, level, message, is_resolved, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `);
  
  stmt.run(id, printerId, type, level, message, now);
  
  const alert = getAlertById(id);
  if (!alert) {
    throw new Error('Failed to create alert');
  }
  return alert;
}

export function resolveAlert(id: string): Alert | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const result = db.prepare(`
    UPDATE alerts
    SET is_resolved = 1, resolved_at = ?
    WHERE id = ?
  `).run(now, id);
  
  if (result.changes === 0) {
    return null;
  }
  
  return getAlertById(id);
}

export function resolveAlertsForPrinter(printerId: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE alerts
    SET is_resolved = 1, resolved_at = ?
    WHERE printer_id = ? AND type = 'low_stock' AND is_resolved = 0
  `).run(now, printerId);
}

export function checkAndCreateLowStockAlert(printerId: string): void {
  const printer = getPrinterById(printerId);
  if (!printer) return;
  
  const stockRatio = printer.currentStock / printer.minStock;
  
  if (stockRatio <= 0.3) {
    createAlert(
      printerId,
      'low_stock',
      'danger',
      `${printer.location}打印机库存严重不足，仅剩 ${printer.currentStock} 包`
    );
  } else if (stockRatio <= 0.7) {
    createAlert(
      printerId,
      'low_stock',
      'warning',
      `${printer.location}打印机库存低于安全库存，当前 ${printer.currentStock} 包`
    );
  }
}

export function checkAbnormalConsumption(printerId: string, quantity: number): boolean {
  if (quantity >= ABNORMAL_THRESHOLD) {
    return true;
  }
  
  const db = getDb();
  const result = db.prepare(`
    SELECT AVG(quantity) as avg_quantity
    FROM consumptions
    WHERE printer_id = ? AND created_at >= datetime('now', '-7 days')
  `).get(printerId) as { avg_quantity: number | null };
  
  if (result.avg_quantity && quantity > result.avg_quantity * ABNORMAL_DAILY_AVERAGE_THRESHOLD) {
    const printer = getPrinterById(printerId);
    if (printer) {
      createAlert(
        printerId,
        'abnormal_consumption',
        'warning',
        `${printer.location}出现异常大量领用：${quantity} 包`
      );
    }
    return true;
  }
  
  return false;
}

export function checkAllPrintersStock(): void {
  const db = getDb();
  const printers = db.prepare('SELECT id, location, current_stock, min_stock FROM printers').all() as Array<{ id: string; location: string; current_stock: number; min_stock: number }>;
  
  for (const printer of printers) {
    checkAndCreateLowStockAlert(printer.id);
  }
}
