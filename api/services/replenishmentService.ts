import { v4 as uuidv4 } from 'uuid';
import { getDb, rowToReplenishment } from '../data/database';
import { updatePrinterStock, getPrinterById } from './printerService';
import { resolveAlertsForPrinter } from './alertService';
import type { Replenishment, CreateReplenishmentRequest } from '../../shared/types';

const PAPER_PER_BOX = 10;

export function getAllReplenishments(printerId?: string, supplier?: string): Replenishment[] {
  const db = getDb();
  let query = `
    SELECT r.*, p.location as printer_location
    FROM replenishments r
    LEFT JOIN printers p ON r.printer_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (printerId) {
    query += ' AND r.printer_id = ?';
    params.push(printerId);
  }
  if (supplier) {
    query += ' AND r.supplier = ?';
    params.push(supplier);
  }
  
  query += ' ORDER BY r.created_at DESC';
  
  const rows = db.prepare(query).all(...params);
  return rows.map(rowToReplenishment);
}

export function getReplenishmentById(id: string): Replenishment | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT r.*, p.location as printer_location
    FROM replenishments r
    LEFT JOIN printers p ON r.printer_id = p.id
    WHERE r.id = ?
  `).get(id);
  return row ? rowToReplenishment(row) : null;
}

export function createReplenishment(data: CreateReplenishmentRequest): Replenishment {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const totalAmount = data.boxCount * data.unitPrice;
  const stockIncrease = data.boxCount * PAPER_PER_BOX;
  
  const stmt = db.prepare(`
    INSERT INTO replenishments (id, printer_id, supplier, box_count, unit_price, total_amount, photo_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.printerId,
    data.supplier,
    data.boxCount,
    data.unitPrice,
    totalAmount,
    data.photoUrl,
    now
  );
  
  updatePrinterStock(data.printerId, stockIncrease);
  resolveAlertsForPrinter(data.printerId);
  
  const replenishment = getReplenishmentById(id);
  if (!replenishment) {
    throw new Error('Failed to create replenishment');
  }
  return replenishment;
}

export function getTotalCostByPrinter(printerId: string): number {
  const db = getDb();
  const result = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as total_cost
    FROM replenishments
    WHERE printer_id = ?
  `).get(printerId) as { total_cost: number };
  
  return result.total_cost;
}
