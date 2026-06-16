import type { CoffeeBean, FlavorStatus } from '../types';
import { addDays, getToday, isBefore, isAfter, getDaysFromNow } from './dateUtils';

export function getFlavorStatus(bean: CoffeeBean): FlavorStatus {
  const today = getToday();
  const restEndDate = addDays(bean.roastDate, bean.restDays);
  const bestFlavorEndDate = addDays(bean.roastDate, bean.bestFlavorDays);
  const expiryDate = addDays(bestFlavorEndDate, 3);

  if (isBefore(today, restEndDate)) {
    return 'resting';
  } else if (isBefore(today, bestFlavorEndDate) || today === bestFlavorEndDate) {
    return 'best';
  } else if (isBefore(today, expiryDate) || today === expiryDate) {
    return 'nearExpiry';
  } else {
    return 'expired';
  }
}

export function getFlavorStatusText(status: FlavorStatus): string {
  const map: Record<FlavorStatus, string> = {
    resting: '养豆中',
    best: '最佳风味',
    nearExpiry: '临期',
    expired: '已超期',
  };
  return map[status];
}

export function getFlavorStatusColor(status: FlavorStatus): string {
  const map: Record<FlavorStatus, string> = {
    resting: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    best: 'text-orange-600 bg-orange-50 border-orange-200',
    nearExpiry: 'text-amber-600 bg-amber-50 border-amber-200',
    expired: 'text-red-600 bg-red-50 border-red-200',
  };
  return map[status];
}

export function getFlavorStatusBorderColor(status: FlavorStatus): string {
  const map: Record<FlavorStatus, string> = {
    resting: 'border-l-emerald-500',
    best: 'border-l-orange-500',
    nearExpiry: 'border-l-amber-500',
    expired: 'border-l-red-500',
  };
  return map[status];
}

export function getRecommendedOpenDate(bean: CoffeeBean): string {
  return addDays(bean.roastDate, bean.restDays);
}

export function getBestFlavorEndDate(bean: CoffeeBean): string {
  return addDays(bean.roastDate, bean.bestFlavorDays);
}

export function getDaysUntilBest(bean: CoffeeBean): number {
  const restEndDate = addDays(bean.roastDate, bean.restDays);
  return getDaysFromNow(restEndDate);
}

export function getDaysUntilExpiry(bean: CoffeeBean): number {
  const bestEndDate = addDays(bean.roastDate, bean.bestFlavorDays);
  return getDaysFromNow(bestEndDate);
}

export function canSetAsTodayPick(bean: CoffeeBean): boolean {
  return getFlavorStatus(bean) === 'best';
}

export function getStatusTip(bean: CoffeeBean): string {
  const status = getFlavorStatus(bean);
  switch (status) {
    case 'resting':
      const days = getDaysUntilBest(bean);
      return `还有 ${days} 天进入最佳风味期`;
    case 'best':
      const daysLeft = getDaysUntilExpiry(bean);
      return `最佳风味还剩 ${daysLeft} 天`;
    case 'nearExpiry':
      return '建议尽快制作特调饮品';
    case 'expired':
      return '已超最佳风味期，建议下架';
    default:
      return '';
  }
}
