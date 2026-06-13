import { getDb } from '../data/database';
import { getAllPrinters } from './printerService';
import type { ConsumptionRate, DepartmentUsage, ReplenishmentForecast } from '../../shared/types';

export function getConsumptionRate(): ConsumptionRate[] {
  const db = getDb();
  const printers = getAllPrinters();
  
  return printers.map(printer => {
    const dailyResult = db.prepare(`
      SELECT COALESCE(SUM(quantity) / MAX(1, CAST(JULIANDAY('now') - JULIANDAY(MIN(created_at)) AS INTEGER)), 0) as daily_avg
      FROM consumptions
      WHERE printer_id = ? AND created_at >= datetime('now', '-30 days')
    `).get(printer.id) as { daily_avg: number };
    
    const weeklyResult = db.prepare(`
      SELECT COALESCE(SUM(quantity), 0) as weekly_sum
      FROM consumptions
      WHERE printer_id = ? AND created_at >= datetime('now', '-7 days')
    `).get(printer.id) as { weekly_sum: number };
    
    const monthlyResult = db.prepare(`
      SELECT COALESCE(SUM(quantity), 0) as monthly_sum
      FROM consumptions
      WHERE printer_id = ? AND created_at >= datetime('now', '-30 days')
    `).get(printer.id) as { monthly_sum: number };
    
    return {
      printerId: printer.id,
      printerLocation: printer.location,
      dailyAverage: Math.round(dailyResult.daily_avg * 10) / 10,
      weeklyAverage: Math.round(weeklyResult.weekly_sum / 7 * 10) / 10,
      monthlyAverage: Math.round(monthlyResult.monthly_sum / 30 * 10) / 10,
    };
  });
}

export function getDepartmentUsage(): DepartmentUsage[] {
  const db = getDb();
  
  const totalResult = db.prepare(`
    SELECT COALESCE(SUM(quantity), 0) as total
    FROM consumptions
    WHERE created_at >= datetime('now', '-30 days')
  `).get() as { total: number };
  
  const total = totalResult.total || 1;
  
  const rows = db.prepare(`
    SELECT 
      department,
      SUM(quantity) as total_quantity
    FROM consumptions
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY department
    ORDER BY total_quantity DESC
  `).all() as { department: string; total_quantity: number }[];
  
  return rows.map(row => ({
    department: row.department,
    totalQuantity: row.total_quantity,
    percentage: Math.round((row.total_quantity / total) * 100 * 10) / 10,
  }));
}

export function getReplenishmentForecast(): ReplenishmentForecast[] {
  const db = getDb();
  const printers = getAllPrinters();
  const consumptionRates = getConsumptionRate();
  
  return printers.map(printer => {
    const rate = consumptionRates.find(r => r.printerId === printer.id);
    const dailyConsumption = rate?.dailyAverage || 0.5;
    
    const estimatedDaysLeft = dailyConsumption > 0 
      ? Math.max(0, Math.floor((printer.currentStock - printer.minStock) / dailyConsumption))
      : 999;
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + estimatedDaysLeft);
    
    const suggestedQuantity = Math.max(
      printer.minStock * 2,
      Math.ceil(dailyConsumption * 30)
    );
    
    return {
      printerId: printer.id,
      printerLocation: printer.location,
      currentStock: printer.currentStock,
      minStock: printer.minStock,
      dailyConsumption,
      estimatedDaysLeft,
      nextReplenishmentDate: estimatedDaysLeft > 0 && estimatedDaysLeft < 999
        ? nextDate.toISOString().split('T')[0]
        : '无需补货',
      suggestedQuantity,
    };
  }).sort((a, b) => a.estimatedDaysLeft - b.estimatedDaysLeft);
}

export function getDailyConsumptionTrend(days: number = 30) {
  const db = getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const rows = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      SUM(quantity) as total_quantity
    FROM consumptions
    WHERE created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(startDate.toISOString());
  
  return rows;
}
