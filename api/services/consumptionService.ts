import { v4 as uuidv4 } from 'uuid';
import { getDb, rowToConsumption } from '../data/database';
import { updatePrinterStock } from './printerService';
import { checkAndCreateLowStockAlert, checkAbnormalConsumption } from './alertService';
import type { Consumption, CreateConsumptionRequest } from '../../shared/types';

export function getAllConsumptions(printerId?: string, department?: string): Consumption[] {
  const db = getDb();
  let query = `
    SELECT c.*, p.location as printer_location
    FROM consumptions c
    LEFT JOIN printers p ON c.printer_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (printerId) {
    query += ' AND c.printer_id = ?';
    params.push(printerId);
  }
  if (department) {
    query += ' AND c.department = ?';
    params.push(department);
  }
  
  query += ' ORDER BY c.created_at DESC';
  
  const rows = db.prepare(query).all(...params);
  return rows.map(rowToConsumption);
}

export function getConsumptionById(id: string): Consumption | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT c.*, p.location as printer_location
    FROM consumptions c
    LEFT JOIN printers p ON c.printer_id = p.id
    WHERE c.id = ?
  `).get(id);
  return row ? rowToConsumption(row) : null;
}

export function createConsumption(data: CreateConsumptionRequest): Consumption {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const isAbnormal = checkAbnormalConsumption(data.printerId, data.quantity);
  
  const stmt = db.prepare(`
    INSERT INTO consumptions (id, printer_id, department, quantity, purpose, receiver, is_abnormal, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.printerId,
    data.department,
    data.quantity,
    data.purpose,
    data.receiver,
    isAbnormal ? 1 : 0,
    now
  );
  
  updatePrinterStock(data.printerId, -data.quantity);
  checkAndCreateLowStockAlert(data.printerId);
  
  const consumption = getConsumptionById(id);
  if (!consumption) {
    throw new Error('Failed to create consumption');
  }
  return consumption;
}

export function getConsumptionStatsByDateRange(startDate: string, endDate: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      printer_id,
      DATE(created_at) as date,
      SUM(quantity) as total_quantity
    FROM consumptions
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY printer_id, DATE(created_at)
    ORDER BY date ASC
  `).all(startDate, endDate);
  
  return rows;
}
