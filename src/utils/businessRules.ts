import type { Box, CleaningRecord, MaintenanceRecord } from '../types';
import { getTodayString, getDaysSince } from './helpers';

export function isFullyCleaned(record: CleaningRecord): boolean {
  return (
    record.residueRemoved &&
    record.interiorWiped &&
    record.disinfected &&
    record.dried &&
    record.zipperChecked &&
    record.odorChecked
  );
}

export function getTodayCleaningRecord(
  boxId: string,
  cleaningRecords: CleaningRecord[],
  date?: string
): CleaningRecord | undefined {
  const targetDate = date || getTodayString();
  return cleaningRecords.find(
    (r) => r.boxId === boxId && r.cleaningDate === targetDate
  );
}

export function getOpenMaintenanceRecord(
  boxId: string,
  maintenanceRecords: MaintenanceRecord[]
): MaintenanceRecord | undefined {
  return maintenanceRecords.find(
    (r) =>
      r.boxId === boxId &&
      (r.status === 'pending' || r.status === 'in_progress')
  );
}

export function canAssignHotFood(
  boxId: string,
  boxes: Box[],
  cleaningRecords: CleaningRecord[],
  maintenanceRecords: MaintenanceRecord[],
  date?: string
): { allowed: boolean; reason: string } {
  const box = boxes.find((b) => b.id === boxId);

  if (!box) {
    return { allowed: false, reason: '箱子不存在' };
  }

  if (box.status === 'scrapped') {
    return { allowed: false, reason: '箱子已报废' };
  }

  if (box.status === 'maintenance') {
    return { allowed: false, reason: '箱子维修中' };
  }

  const cleaningRecord = getTodayCleaningRecord(boxId, cleaningRecords, date);
  if (!cleaningRecord || !isFullyCleaned(cleaningRecord)) {
    return { allowed: false, reason: '未完成今日清洁，禁止分配热食订单' };
  }

  const openMaintenance = getOpenMaintenanceRecord(boxId, maintenanceRecords);
  if (openMaintenance) {
    return { allowed: false, reason: `存在未解决异常` };
  }

  return { allowed: true, reason: '' };
}

export function needsReplacement(box: Box): boolean {
  const daysUsed = getDaysSince(box.purchaseDate);
  return daysUsed > 180;
}

export function hasTooManyRepairs(
  boxId: string,
  maintenanceRecords: MaintenanceRecord[]
): boolean {
  const repairedCount = maintenanceRecords.filter(
    (r) => r.boxId === boxId && r.status === 'repaired'
  ).length;
  return repairedCount >= 3;
}

export function getReplacementWarning(
  box: Box,
  maintenanceRecords: MaintenanceRecord[]
): { needsReplace: boolean; reason: string } {
  if (needsReplacement(box)) {
    const daysUsed = getDaysSince(box.purchaseDate);
    return {
      needsReplace: true,
      reason: `已使用 ${daysUsed} 天，超过建议更换周期（180天）`,
    };
  }

  if (hasTooManyRepairs(box.id, maintenanceRecords)) {
    return {
      needsReplace: true,
      reason: '累计维修次数已达 3 次，建议报废更换',
    };
  }

  return { needsReplace: false, reason: '' };
}

export function getCleaningCompletionRate(
  boxes: Box[],
  cleaningRecords: CleaningRecord[],
  date?: string
): number {
  const targetDate = date || getTodayString();
  const activeBoxes = boxes.filter(
    (b) => b.status !== 'scrapped' && b.status !== 'maintenance'
  );

  if (activeBoxes.length === 0) return 0;

  const cleanedCount = activeBoxes.filter((box) => {
    const record = getTodayCleaningRecord(box.id, cleaningRecords, targetDate);
    return record && isFullyCleaned(record);
  }).length;

  return Math.round((cleanedCount / activeBoxes.length) * 100);
}

export function getPendingCleaningBoxes(
  boxes: Box[],
  cleaningRecords: CleaningRecord[],
  date?: string
): Box[] {
  const targetDate = date || getTodayString();
  return boxes.filter((box) => {
    if (box.status === 'scrapped' || box.status === 'maintenance') return false;
    const record = getTodayCleaningRecord(box.id, cleaningRecords, targetDate);
    return !record || !isFullyCleaned(record);
  });
}

export function getAbnormalBoxes(
  boxes: Box[],
  maintenanceRecords: MaintenanceRecord[]
): Box[] {
  return boxes.filter((box) => {
    if (box.status === 'scrapped') return false;
    return getOpenMaintenanceRecord(box.id, maintenanceRecords) !== undefined;
  });
}
