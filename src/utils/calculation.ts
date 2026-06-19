import type { LitterBox, CleaningRecord, DashboardStats } from '@/types';

function differenceInDays(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date1.getTime() - date2.getTime()) / oneDay);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateTodayPending(
  litterBoxes: LitterBox[],
  records: CleaningRecord[]
): number {
  const today = new Date().toISOString().split('T')[0];
  let pending = 0;
  
  litterBoxes.forEach(box => {
    const todayRecords = records.filter(
      r => r.litterBoxId === box.id && r.date === today && r.operationTypes.includes('scoop')
    );
    if (todayRecords.length < box.cleaningFrequency) {
      pending += box.cleaningFrequency - todayRecords.length;
    }
  });
  
  return pending;
}

export function calculateAbnormalCount(records: CleaningRecord[]): number {
  return records.filter(r => r.isAbnormal).length;
}

export function calculateLitterStock(records: CleaningRecord[]): number {
  const totalAdded = records
    .filter(r => r.operationTypes.includes('add_litter'))
    .reduce((sum, r) => sum + (r.litterAdded || 0), 0);
  
  const fullChanges = records.filter(r => r.operationTypes.includes('full_change')).length;
  const estimatedUsed = fullChanges * 5 + records.length * 0.1;
  
  return Math.max(0, 15 - estimatedUsed + totalAdded);
}

export function calculateNextFullChange(
  litterBoxes: LitterBox[]
): { days: number; boxName: string } {
  let minDays = Infinity;
  let nearestBox = '';
  
  litterBoxes.forEach(box => {
    if (box.lastFullChangeDate) {
      const lastChange = new Date(box.lastFullChangeDate);
      const nextChange = addDays(lastChange, box.fullChangeInterval);
      const days = differenceInDays(nextChange, new Date());
      
      if (days < minDays) {
        minDays = days;
        nearestBox = box.location;
      }
    }
  });
  
  return {
    days: minDays === Infinity ? 7 : Math.max(0, minDays),
    boxName: nearestBox || '未设置',
  };
}

export function calculateDashboardStats(
  litterBoxes: LitterBox[],
  records: CleaningRecord[]
): DashboardStats {
  const nextChange = calculateNextFullChange(litterBoxes);
  
  return {
    todayPending: calculateTodayPending(litterBoxes, records),
    abnormalCount: calculateAbnormalCount(records),
    litterStock: calculateLitterStock(records),
    nextFullChangeDays: nextChange.days,
    nextFullChangeBoxName: nextChange.boxName,
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dateOnly === todayStr) {
    return `今天 ${timeStr}`;
  } else if (dateOnly === yesterdayStr) {
    return `昨天 ${timeStr}`;
  } else {
    return `${formatDate(dateStr)} ${timeStr}`;
  }
}
