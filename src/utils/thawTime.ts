import type { ThawMethod } from '@/types';
import { formatTime, subtractHours, addHours, hoursBetween } from './dateUtils';

interface ThawTimeRange {
  min: number;
  max: number;
}

export function getThawTimeRange(weight: number, method: ThawMethod): ThawTimeRange {
  if (method === 'cold_water') {
    if (weight < 200) return { min: 0.5, max: 0.75 };
    if (weight < 500) return { min: 1, max: 1.5 };
    if (weight < 1000) return { min: 2, max: 3 };
    return { min: 3, max: 5 };
  } else {
    if (weight < 200) return { min: 3, max: 4 };
    if (weight < 500) return { min: 5, max: 7 };
    if (weight < 1000) return { min: 8, max: 12 };
    return { min: 12, max: 24 };
  }
}

export function getAverageThawTime(weight: number, method: ThawMethod): number {
  const range = getThawTimeRange(weight, method);
  return (range.min + range.max) / 2;
}

export function getThawReadyTime(
  thawStartTime: string,
  weight: number,
  method: ThawMethod
): Date {
  const thawHours = getAverageThawTime(weight, method);
  return addHours(thawStartTime, thawHours);
}

export function getThawProgress(
  thawStartTime: string,
  weight: number,
  method: ThawMethod
): number {
  const totalHours = getAverageThawTime(weight, method);
  const elapsedHours = hoursBetween(thawStartTime, new Date());
  return Math.min(100, Math.max(0, (elapsedHours / totalHours) * 100));
}

export function getRemainingThawTime(
  thawStartTime: string,
  weight: number,
  method: ThawMethod
): number {
  const totalHours = getAverageThawTime(weight, method);
  const elapsedHours = hoursBetween(thawStartTime, new Date());
  return Math.max(0, totalHours - elapsedHours);
}

export function calculateTakeOutTime(
  dinnerTime: string | Date,
  weight: number,
  method: ThawMethod
): Date {
  const thawHours = getAverageThawTime(weight, method);
  const prepTime = 0.5;
  return subtractHours(dinnerTime, thawHours + prepTime);
}

export function canMakeItForDinner(
  dinnerTime: string | Date,
  weight: number,
  method: ThawMethod
): boolean {
  const takeOutTime = calculateTakeOutTime(dinnerTime, weight, method);
  return takeOutTime <= new Date();
}

export function getThawMethodLabel(method: ThawMethod): string {
  return method === 'fridge' ? '冷藏解冻' : '冷水解冻';
}

export function getThawMethodDescription(method: ThawMethod): string {
  return method === 'fridge'
    ? '放冰箱冷藏，慢慢解冻，口感更好'
    : '用冷水浸泡，快速解冻，适合急用';
}
