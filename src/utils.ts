import { ParkingZone, VisitorRecord } from './types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

export const calculateFee = (zone: ParkingZone, entryTime: string, exitTime: string): number => {
  const entry = new Date(entryTime).getTime();
  const exit = new Date(exitTime).getTime();
  const totalMinutes = Math.ceil((exit - entry) / (1000 * 60));
  
  if (totalMinutes <= zone.freeMinutes) {
    return 0;
  }
  
  const billableMinutes = totalMinutes - zone.freeMinutes;
  const billableHours = Math.ceil(billableMinutes / 60);
  const fee = billableHours * zone.feePerHour;
  
  return Math.min(fee, zone.maxDailyFee);
};

export const getDurationMinutes = (entryTime: string, exitTime: string): number => {
  const entry = new Date(entryTime).getTime();
  const exit = new Date(exitTime).getTime();
  return Math.ceil((exit - entry) / (1000 * 60));
};

export const isOverdue = (estimatedLeaveTime: string): boolean => {
  return new Date() > new Date(estimatedLeaveTime);
};

export const getPaymentStatusText = (status: string): string => {
  const map: Record<string, string> = {
    unpaid: '未付',
    paid: '已付',
    waived: '减免',
  };
  return map[status] || status;
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('保存失败', e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const getTodayRecords = (records: VisitorRecord[]): VisitorRecord[] => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  return records.filter(r => r.entryTime.startsWith(todayStr));
};

export const getActiveRecords = (records: VisitorRecord[]): VisitorRecord[] => {
  return records.filter(r => !r.exitTime);
};

export const getOverdueRecords = (records: VisitorRecord[]): VisitorRecord[] => {
  return records.filter(r => !r.exitTime && isOverdue(r.estimatedLeaveTime));
};

export const getTodayRevenue = (records: VisitorRecord[]): number => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  return records
    .filter(r => r.exitTime && r.exitTime.startsWith(todayStr) && r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + (r.fee || 0), 0);
};
