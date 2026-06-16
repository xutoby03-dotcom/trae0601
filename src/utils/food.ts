import type { FoodItem, FoodStatus } from '@/types';
import {
  daysUntil,
  hoursUntil,
  minutesUntil,
  formatDate,
  formatDateTime,
  addDaysIso,
  toDatePart,
} from './date';
import { OPENED_SHELF_LIFE_RULES, type OpenedShelfLifeRule } from './constants';

export function matchOpenedShelfLifeRule(
  name: string,
  category?: string
): OpenedShelfLifeRule | null {
  const trimmedName = name.trim();
  for (const rule of OPENED_SHELF_LIFE_RULES) {
    const nameHit =
      rule.keywords && rule.keywords.length > 0
        ? rule.keywords.some((kw) => trimmedName.includes(kw))
        : false;
    const categoryHit =
      rule.categories && rule.categories.length > 0 && category
        ? rule.categories.some((c) => c === category)
        : false;
    if (nameHit || categoryHit) return rule;
  }
  return null;
}

export function getOpenedShelfLifeDays(
  name: string,
  category: string,
  fallback: number
): { days: number; matched: boolean; ruleLabel?: string } {
  const rule = matchOpenedShelfLifeRule(name, category);
  if (rule) {
    return { days: rule.days, matched: true, ruleLabel: rule.label };
  }
  return { days: fallback, matched: false };
}

function getExpiryEndOfDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function getEffectiveExpiry(food: FoodItem): string {
  if (food.openedAt) {
    const { days } = getOpenedShelfLifeDays(
      food.name,
      food.category,
      food.openedShelfLifeDays
    );
    return addDaysIso(food.openedAt, days);
  }
  return getExpiryEndOfDay(food.expiryDate);
}

export function describeEffectiveExpiry(food: FoodItem): {
  expiry: string;
  isOpened: boolean;
  label?: string;
  openedDays: number;
} {
  if (food.openedAt) {
    const { days, ruleLabel } = getOpenedShelfLifeDays(
      food.name,
      food.category,
      food.openedShelfLifeDays
    );
    return {
      expiry: addDaysIso(food.openedAt, days),
      isOpened: true,
      label: ruleLabel,
      openedDays: days,
    };
  }
  return {
    expiry: getExpiryEndOfDay(food.expiryDate),
    isOpened: false,
    openedDays: food.shelfLifeDays,
  };
}

export function getFoodStatus(food: FoodItem): FoodStatus {
  const expiry = getEffectiveExpiry(food);
  const hours = hoursUntil(expiry);
  if (hours < 0) return 'expired';
  if (hours <= 24) return 'danger';
  if (hours <= 24 * 3) return 'warning';
  return 'fresh';
}

export function getExpiryProgress(food: FoodItem): number {
  const expiry = getEffectiveExpiry(food);
  const totalHours = food.shelfLifeDays * 24;
  const remainingHours = hoursUntil(expiry);
  const used = totalHours - remainingHours;
  return Math.min(100, Math.max(0, (used / totalHours) * 100));
}

export function getCountdownText(food: FoodItem): string {
  const expiry = getEffectiveExpiry(food);
  const days = daysUntil(expiry);
  const hours = hoursUntil(expiry);
  const minutes = minutesUntil(expiry);

  if (hours < 0) {
    const absHours = Math.abs(hours);
    if (absHours < 24) return `已过期 ${absHours} 小时`;
    return `已过期 ${Math.abs(days)} 天`;
  }
  if (hours < 1) {
    return `剩 ${Math.max(1, minutes)} 分钟`;
  }
  if (hours < 24) {
    return `剩 ${hours} 小时${minutes % 60 > 0 ? ` ${minutes % 60}分` : ''}`;
  }
  if (days === 1) return '明天到期';
  if (days <= 7) return `剩 ${days} 天`;
  return `${formatDate(expiry)} 过期`;
}

export function getExpiryDisplay(food: FoodItem): string {
  const expiry = getEffectiveExpiry(food);
  return formatDateTime(expiry);
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

export function isOpenedExpiry(food: FoodItem): boolean {
  return !!food.openedAt;
}
