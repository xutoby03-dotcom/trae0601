import { FilterReplacement, FilterStatus, WaterRefill } from '../types';
import { daysBetween, getToday } from './date';

export function calculateFilterLifePercent(
  currentFilter: FilterReplacement | null
): number {
  if (!currentFilter) return 0;

  const daysUsed = daysBetween(currentFilter.installDate, getToday());
  const percent = ((currentFilter.expectedLifeDays - daysUsed) / currentFilter.expectedLifeDays) * 100;

  return Math.max(0, Math.min(100, percent));
}

export function calculateFilterDaysLeft(
  currentFilter: FilterReplacement | null
): number {
  if (!currentFilter) return 0;

  const daysUsed = daysBetween(currentFilter.installDate, getToday());
  return Math.max(0, currentFilter.expectedLifeDays - daysUsed);
}

export function getFilterStatus(lifePercent: number): FilterStatus {
  if (lifePercent <= 0) return 'expired';
  if (lifePercent < 30) return 'warning';
  if (lifePercent < 70) return 'normal';
  return 'healthy';
}

export function getStatusColor(status: FilterStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-emerald-600';
    case 'normal':
      return 'text-sky-600';
    case 'warning':
      return 'text-amber-600';
    case 'expired':
      return 'text-red-600';
  }
}

export function getStatusBgColor(status: FilterStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-500';
    case 'normal':
      return 'bg-sky-500';
    case 'warning':
      return 'bg-amber-500';
    case 'expired':
      return 'bg-red-500';
  }
}

export function getStatusLabel(status: FilterStatus): string {
  switch (status) {
    case 'healthy':
      return '健康';
    case 'normal':
      return '正常';
    case 'warning':
      return '即将到期';
    case 'expired':
      return '已过期';
  }
}

export function calculateRefillCountInDays(
  refills: WaterRefill[],
  days: number
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return refills
    .filter((r) => new Date(r.date) >= cutoff)
    .reduce((sum, r) => sum + r.count, 0);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getAlertTypeLabel(type: string): string {
  switch (type) {
    case 'slow_flow':
      return '水流变慢';
    case 'odor':
      return '异味';
    case 'chlorine_test':
      return '余氯测试异常';
    default:
      return type;
  }
}

export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'low':
      return '轻微';
    case 'medium':
      return '中等';
    case 'high':
      return '严重';
    default:
      return severity;
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'text-amber-600 bg-amber-50';
    case 'medium':
      return 'text-orange-600 bg-orange-50';
    case 'high':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
