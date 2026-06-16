import type { FoodItem, FoodStatus } from '@/types';
import { daysUntil, hoursUntil, formatDate } from './date';
import { OPENED_SHELF_LIFE_OVERRIDE } from './constants';

export function getEffectiveExpiry(food: FoodItem): string {
  if (food.openedAt) {
    const overrideDays = OPENED_SHELF_LIFE_OVERRIDE[food.name] ?? food.openedShelfLifeDays;
    const openedDate = new Date(food.openedAt);
    openedDate.setDate(openedDate.getDate() + overrideDays);
    return openedDate.toISOString().split('T')[0];
  }
  return food.expiryDate;
}

export function getFoodStatus(food: FoodItem): FoodStatus {
  const expiry = getEffectiveExpiry(food);
  const days = daysUntil(expiry);
  if (days < 0) return 'expired';
  if (days === 0 || hoursUntil(expiry) <= 24) return 'danger';
  if (days <= 3) return 'warning';
  return 'fresh';
}

export function getExpiryProgress(food: FoodItem): number {
  const expiry = getEffectiveExpiry(food);
  const total = food.shelfLifeDays;
  const remaining = daysUntil(expiry);
  const used = total - remaining;
  return Math.min(100, Math.max(0, (used / total) * 100));
}

export function getCountdownText(food: FoodItem): string {
  const expiry = getEffectiveExpiry(food);
  const days = daysUntil(expiry);
  const hours = hoursUntil(expiry);

  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  if (days === 0) {
    if (hours <= 0) return '今天过期';
    return `剩 ${hours} 小时`;
  }
  if (days === 1) return '明天过期';
  if (days <= 7) return `剩 ${days} 天`;
  return `${formatDate(expiry)} 过期`;
}

export function getStatusColor(status: FoodStatus): string {
  switch (status) {
    case 'expired':
      return 'border-red-400 bg-red-50';
    case 'danger':
      return 'border-orange-400 bg-orange-50';
    case 'warning':
      return 'border-amber-400 bg-amber-50';
    default:
      return 'border-emerald-300 bg-white';
  }
}

export function getStatusTextColor(status: FoodStatus): string {
  switch (status) {
    case 'expired':
      return 'text-red-600';
    case 'danger':
      return 'text-orange-600';
    case 'warning':
      return 'text-amber-600';
    default:
      return 'text-emerald-600';
  }
}

export function getStatusBadgeClass(status: FoodStatus): string {
  switch (status) {
    case 'expired':
      return 'bg-red-100 text-red-700';
    case 'danger':
      return 'bg-orange-100 text-orange-700 animate-pulse';
    case 'warning':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

export function getStatusLabel(status: FoodStatus): string {
  switch (status) {
    case 'expired':
      return '已过期';
    case 'danger':
      return '今天吃';
    case 'warning':
      return '尽快吃';
    default:
      return '新鲜';
  }
}

export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function getRemainingText(food: FoodItem): string {
  const actualQty = food.quantity * food.remaining;
  if (food.remaining === 1) {
    return `${food.quantity}${food.unit}`;
  }
  if (food.remaining === 0) {
    return `0${food.unit}`;
  }
  const percentage = Math.round(food.remaining * 100);
  return `${actualQty.toFixed(actualQty < 1 ? 1 : 0)}${food.unit} (${percentage}%)`;
}

export function compareByUrgency(a: FoodItem, b: FoodItem): number {
  const expiryA = getEffectiveExpiry(a);
  const expiryB = getEffectiveExpiry(b);
  return new Date(expiryA).getTime() - new Date(expiryB).getTime();
}
