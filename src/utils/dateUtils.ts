import dayjs from 'dayjs';
import type { OpenRecord, Ingredient, AlertItem } from '../types';
import { generateId } from './storage';

export function daysBetween(date1: string, date2: string): number {
  return dayjs(date1).startOf('day').diff(dayjs(date2).startOf('day'), 'day');
}

export function isExpired(openRecord: OpenRecord, ingredient: Ingredient): boolean {
  const daysOpened = daysBetween(dayjs().format('YYYY-MM-DD'), openRecord.openDate);
  return daysOpened >= ingredient.openedDays;
}

export function daysUntilExpiry(openRecord: OpenRecord, ingredient: Ingredient): number {
  const daysOpened = daysBetween(dayjs().format('YYYY-MM-DD'), openRecord.openDate);
  return ingredient.openedDays - daysOpened;
}

export function isTempOutOfRange(openRecord: OpenRecord, ingredient: Ingredient): boolean {
  if (openRecord.actualTemp === undefined) return false;
  return openRecord.actualTemp < ingredient.storageTempMin || openRecord.actualTemp > ingredient.storageTempMax;
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function generateAlerts(
  _openRecords: OpenRecord[],
  ingredients: Ingredient[],
  currentOpenRecords: OpenRecord[]
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  currentOpenRecords.forEach((record) => {
    const ingredient = ingredientMap.get(record.ingredientId);
    if (!ingredient) return;

    const daysLeft = daysUntilExpiry(record, ingredient);

    if (daysLeft < 0) {
      alerts.push({
        id: generateId(),
        type: 'expired',
        level: 'danger',
        title: `⚠️ ${ingredient.name} 开封超期`,
        description: `已开封 ${Math.abs(daysLeft)} 天，超过开封后可用 ${ingredient.openedDays} 天。批次：${ingredient.batch}`,
        ingredientId: ingredient.id,
        openRecordId: record.id,
        timestamp: now,
        acknowledged: false,
      });
    } else if (daysLeft <= 1) {
      alerts.push({
        id: generateId(),
        type: 'expired',
        level: 'warning',
        title: `⏰ ${ingredient.name} 即将过期`,
        description: `剩余 ${daysLeft} 天保质期，请尽快使用。批次：${ingredient.batch}`,
        ingredientId: ingredient.id,
        openRecordId: record.id,
        timestamp: now,
        acknowledged: false,
      });
    }

    if (isTempOutOfRange(record, ingredient)) {
      alerts.push({
        id: generateId(),
        type: 'temp',
        level: 'danger',
        title: `🌡️ ${ingredient.name} 储存温度不符`,
        description: `当前温度 ${record.actualTemp}°C，要求范围 ${ingredient.storageTempMin}~${ingredient.storageTempMax}°C。存放位置：${record.freezerLocation}`,
        ingredientId: ingredient.id,
        openRecordId: record.id,
        timestamp: now,
        acknowledged: false,
      });
    }

    if (record.remainingWeight <= ingredient.lowStockThreshold && record.remainingWeight > 0) {
      alerts.push({
        id: generateId(),
        type: 'lowStock',
        level: 'warning',
        title: `📦 ${ingredient.name} 剩余量不足`,
        description: `剩余 ${record.remainingWeight}${ingredient.unit}，低于阈值 ${ingredient.lowStockThreshold}${ingredient.unit}`,
        ingredientId: ingredient.id,
        openRecordId: record.id,
        timestamp: now,
        acknowledged: false,
      });
    }
  });

  ingredients.forEach((ing) => {
    const activeRecords = currentOpenRecords.filter((r) => r.ingredientId === ing.id);
    const totalRemaining = activeRecords.reduce((sum, r) => sum + r.remainingWeight, 0);
    if (activeRecords.length === 0 || totalRemaining <= ing.lowStockThreshold) {
      const hasAlert = alerts.some((a) => a.ingredientId === ing.id && a.type === 'lowStock');
      if (!hasAlert) {
        alerts.push({
          id: generateId(),
          type: 'lowStock',
          level: 'warning',
          title: `📦 ${ing.name} 库存告急`,
          description: `总库存约 ${totalRemaining}${ing.unit}，低于阈值 ${ing.lowStockThreshold}${ing.unit}，建议尽快采购`,
          ingredientId: ing.id,
          timestamp: now,
          acknowledged: false,
        });
      }
    }
  });

  return alerts;
}
