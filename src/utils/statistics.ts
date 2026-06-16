import { DailyRecord, Inventory, Statistics, Braces } from '../types';
import { getTodayString, getWeekDates, getDaysDiff, formatDate } from './storage';

export const calculateStatistics = (
  records: DailyRecord[],
  inventories: Inventory[],
  bracesList: Braces[]
): Statistics => {
  const weekDates = getWeekDates();
  const today = getTodayString();
  
  const thisWeekRecords = records.filter(r => weekDates.includes(r.recordDate));
  
  const weeklyQualifiedDays = thisWeekRecords.filter(r => 
    r.wearHours >= 20 && r.isBrushed && r.isSoaked
  ).length;
  
  let consecutiveDays = 0;
  let checkDate = new Date(today);
  while (true) {
    const dateStr = formatDate(checkDate);
    const hasRecord = records.some(r => r.recordDate === dateStr);
    if (hasRecord) {
      consecutiveDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  const totalSoaked = records.filter(r => r.isSoaked).length;
  const firstRecord = records.length > 0 
    ? records.reduce((min, r) => new Date(r.recordDate) < new Date(min.recordDate) ? r : min, records[0])
    : null;
  
  let estimatedDaysLeft = 0;
  if (inventories.length > 0 && firstRecord) {
    const totalDays = Math.max(getDaysDiff(firstRecord.recordDate, today), 1);
    const avgUsage = totalSoaked / totalDays;
    const totalStock = inventories.reduce((sum, inv) => sum + inv.currentStock, 0);
    estimatedDaysLeft = avgUsage > 0 ? Math.floor(totalStock / avgUsage) : totalStock;
  }
  
  return {
    weeklyQualifiedDays,
    consecutiveDays,
    estimatedDaysLeft,
    totalRecords: records.length,
    thisWeekRecords,
  };
};

export const getQualifiedStatus = (record: DailyRecord): { status: 'excellent' | 'good' | 'fair' | 'poor'; color: string } => {
  if (record.wearHours >= 20 && record.isBrushed && record.isSoaked) {
    return { status: 'excellent', color: 'bg-primary' };
  } else if (record.wearHours >= 18 && (record.isBrushed || record.isSoaked)) {
    return { status: 'good', color: 'bg-accent-sky' };
  } else if (record.wearHours >= 12) {
    return { status: 'fair', color: 'bg-accent-yellow' };
  } else {
    return { status: 'poor', color: 'bg-accent-coral' };
  }
};

export const getStatusText = (status: 'excellent' | 'good' | 'fair' | 'poor'): string => {
  const texts = {
    excellent: '优秀 🎉',
    good: '良好 👍',
    fair: '一般 ⚠️',
    poor: '待改进 ❌',
  };
  return texts[status];
};

export const getOdorText = (level: number): string => {
  const texts = ['无异味 ✨', '轻微 🌿', '明显 😐', '严重 🤢'];
  return texts[level] || texts[0];
};

export const getWeeklyProgress = (records: DailyRecord[]): { date: string; qualified: boolean; hasRecord: boolean }[] => {
  const weekDates = getWeekDates();
  return weekDates.map(date => {
    const record = records.find(r => r.recordDate === date);
    return {
      date,
      hasRecord: !!record,
      qualified: record ? record.wearHours >= 20 && record.isBrushed && record.isSoaked : false,
    };
  });
};
