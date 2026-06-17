import { format, addMonths, addDays, differenceInDays, differenceInMonths, isBefore, isAfter } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: zhCN });
};

export const formatDateFriendly = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffDays = differenceInDays(d, now);
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === -1) return '昨天';
  if (diffDays > 0 && diffDays < 7) return `${diffDays}天后`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)}天前`;
  
  return format(d, 'M月d日', { locale: zhCN });
};

export const getMoisturePackExpiry = (placementDate: string | Date): Date => {
  const d = typeof placementDate === 'string' ? new Date(placementDate) : placementDate;
  return addMonths(d, 3);
};

export const isMoisturePackExpiringSoon = (placementDate: string | Date): boolean => {
  const expiry = getMoisturePackExpiry(placementDate);
  const warningDate = addDays(expiry, -7);
  const now = new Date();
  return isBefore(now, expiry) && isAfter(now, warningDate);
};

export const isMoisturePackExpired = (placementDate: string | Date): boolean => {
  const expiry = getMoisturePackExpiry(placementDate);
  return isBefore(expiry, new Date());
};

export const getDaysUntilExpiry = (placementDate: string | Date): number => {
  const expiry = getMoisturePackExpiry(placementDate);
  return differenceInDays(expiry, new Date());
};

export const getMonthsSinceLastWorn = (lastWornDate: string | Date): number => {
  const d = typeof lastWornDate === 'string' ? new Date(lastWornDate) : lastWornDate;
  return differenceInMonths(new Date(), d);
};

export const isDonationCandidate = (lastWornDate: string | Date): boolean => {
  return getMonthsSinceLastWorn(lastWornDate) >= 6;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 17) return '下午好';
  if (hour < 19) return '傍晚好';
  return '晚上好';
};
