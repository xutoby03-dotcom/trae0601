import type { CoffeeBatch, BatchStatus } from '../types';
import { daysSince } from './dateUtils';

const OPTIMAL_PERIOD_DAYS = 14;
const DECLINING_PERIOD_DAYS = 30;

export function getBatchStatus(batch: CoffeeBatch): BatchStatus {
  const isLowStock = batch.currentWeight <= batch.lowThreshold;

  if (!batch.openDate) {
    return isLowStock ? 'low_stock' : 'unopened';
  }

  const daysOpen = daysSince(batch.openDate);

  if (isLowStock) {
    return 'low_stock';
  }

  if (daysOpen < batch.suggestedDays) {
    return 'resting';
  }

  if (daysOpen <= batch.suggestedDays + OPTIMAL_PERIOD_DAYS) {
    return 'optimal';
  }

  if (daysOpen <= batch.suggestedDays + DECLINING_PERIOD_DAYS) {
    return 'declining';
  }

  return 'expired';
}

export function getStatusInfo(status: BatchStatus): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
} {
  const statusMap: Record<BatchStatus, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }> = {
    unopened: {
      label: '未开封',
      color: '#8D6E63',
      bgColor: '#EFEBE9',
      borderColor: '#BCAAA4',
      textColor: '#5D4037',
    },
    resting: {
      label: '养豆中',
      color: '#FF8F00',
      bgColor: '#FFF8E1',
      borderColor: '#FFD54F',
      textColor: '#FF6F00',
    },
    optimal: {
      label: '最佳风味',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      borderColor: '#81C784',
      textColor: '#2E7D32',
    },
    declining: {
      label: '风味下降',
      color: '#FF7043',
      bgColor: '#FBE9E7',
      borderColor: '#FFAB91',
      textColor: '#E64A19',
    },
    expired: {
      label: '已过期',
      color: '#D32F2F',
      bgColor: '#FFEBEE',
      borderColor: '#EF9A9A',
      textColor: '#C62828',
    },
    low_stock: {
      label: '余量不足',
      color: '#D32F2F',
      bgColor: '#FFEBEE',
      borderColor: '#EF9A9A',
      textColor: '#C62828',
    },
  };

  return statusMap[status];
}

export function getDaysUntilOptimal(batch: CoffeeBatch): number | null {
  if (!batch.openDate) return null;
  const daysOpen = daysSince(batch.openDate);
  if (daysOpen >= batch.suggestedDays) return null;
  return batch.suggestedDays - daysOpen;
}

export function getDaysPastOptimal(batch: CoffeeBatch): number | null {
  if (!batch.openDate) return null;
  const daysOpen = daysSince(batch.openDate);
  const optimalEnd = batch.suggestedDays + OPTIMAL_PERIOD_DAYS;
  if (daysOpen <= optimalEnd) return null;
  return daysOpen - optimalEnd;
}

export function getRestingProgress(batch: CoffeeBatch): number {
  if (!batch.openDate) return 0;
  const daysOpen = daysSince(batch.openDate);
  if (daysOpen >= batch.suggestedDays) return 100;
  return Math.round((daysOpen / batch.suggestedDays) * 100);
}

export function getWeightProgress(batch: CoffeeBatch): number {
  if (batch.initialWeight === 0) return 0;
  return Math.round((batch.currentWeight / batch.initialWeight) * 100);
}
