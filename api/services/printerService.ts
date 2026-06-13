import { v4 as uuidv4 } from 'uuid';
import { getDb, rowToPrinter } from '../data/database';
import type { Printer, CreatePrinterRequest } from '../../shared/types';

export function getAllPrinters(): Printer[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM printers ORDER BY created_at DESC').all();
  return rows.map(rowToPrinter);
}

export function getPrinterById(id: string): Printer | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM printers WHERE id = ?').get(id);
  return row ? rowToPrinter(row) : null;
}

export function createPrinter(data: CreatePrinterRequest): Printer {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO printers (id, location, printer_model, paper_spec, min_stock, current_stock, manager, manager_phone, photo_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.location,
    data.printerModel,
    data.paperSpec,
    data.minStock,
    data.currentStock,
    data.manager,
    data.managerPhone,
    data.photoUrl,
    now,
    now
  );
  
  const printer = getPrinterById(id);
  if (!printer) {
    throw new Error('Failed to create printer');
  }
  return printer;
}

export function updatePrinter(id: string, data: Partial<CreatePrinterRequest>): Printer | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.location !== undefined) {
    fields.push('location = ?');
    values.push(data.location);
  }
  if (data.printerModel !== undefined) {
    fields.push('printer_model = ?');
    values.push(data.printerModel);
  }
  if (data.paperSpec !== undefined) {
    fields.push('paper_spec = ?');
    values.push(data.paperSpec);
  }
  if (data.minStock !== undefined) {
    fields.push('min_stock = ?');
    values.push(data.minStock);
  }
  if (data.currentStock !== undefined) {
    fields.push('current_stock = ?');
    values.push(data.currentStock);
  }
  if (data.manager !== undefined) {
    fields.push('manager = ?');
    values.push(data.manager);
  }
  if (data.managerPhone !== undefined) {
    fields.push('manager_phone = ?');
    values.push(data.managerPhone);
  }
  if (data.photoUrl !== undefined) {
    fields.push('photo_url = ?');
    values.push(data.photoUrl);
  }
  
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE printers
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = stmt.run(...values);
  
  if (result.changes === 0) {
    return null;
  }
  
  return getPrinterById(id);
}

export function deletePrinter(id: string): boolean {
  const db = getDb();
  
  db.prepare('DELETE FROM alerts WHERE printer_id = ?').run(id);
  db.prepare('DELETE FROM consumptions WHERE printer_id = ?').run(id);
  db.prepare('DELETE FROM replenishments WHERE printer_id = ?').run(id);
  
  const result = db.prepare('DELETE FROM printers WHERE id = ?').run(id);
  return result.changes > 0;
}

export function updatePrinterStock(printerId: string, quantityChange: number): void {
  const db = getDb();
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE printers
    SET current_stock = current_stock + ?, updated_at = ?
    WHERE id = ?
  `).run(quantityChange, now, printerId);
}
