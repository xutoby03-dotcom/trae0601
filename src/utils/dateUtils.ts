import { getBatteryLifeMonths } from '@/constants';

export const formatDate = (dateStr: string, withTime = false): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${day}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

export const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${-days}天后`;
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
};

export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isSameMonth = (dateStr1: string, dateStr2: string): boolean => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export const isInspectedThisMonth = (inspectDate: string): boolean => {
  return isSameMonth(inspectDate, todayStr());
};

export const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const daysBetween = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1).getTime();
  const d2 = new Date(dateStr2).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const daysFromToday = (dateStr: string): number => {
  return daysBetween(todayStr(), dateStr);
};

export const getNextBatteryReplaceDate = (batteryReplaceDate: string, batteryType: string): string => {
  const life = getBatteryLifeMonths(batteryType);
  return addMonths(batteryReplaceDate, life);
};

export const getBatteryDaysRemaining = (batteryReplaceDate: string, batteryType: string): number => {
  const nextDate = getNextBatteryReplaceDate(batteryReplaceDate, batteryType);
  return daysFromToday(nextDate);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};
