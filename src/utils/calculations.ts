import dayjs from 'dayjs';
import type {
  MaterialType,
  ConsumptionData,
  PurchaseSuggestion,
} from '@/types/index';

export interface InventoryStatusResult {
  status: 'normal' | 'warning' | 'danger';
  percentage: number;
}

export const getInventoryStatus = (quantity: number, threshold: number): InventoryStatusResult => {
  if (threshold <= 0) {
    return { status: 'normal', percentage: 100 };
  }

  const percentage = Math.round((quantity / threshold) * 100);

  if (quantity <= 0) {
    return { status: 'danger', percentage: 0 };
  }

  if (percentage <= 50) {
    return { status: 'danger', percentage };
  }

  if (percentage <= 100) {
    return { status: 'warning', percentage };
  }

  return { status: 'normal', percentage };
};

export const calculateShortage = (
  quantity: number,
  threshold: number,
  multiplier: number = 1
): { isShortage: boolean; adjustedThreshold: number; shortageQty: number } => {
  const adjustedThreshold = Math.round(threshold * multiplier);
  const isShortage = quantity < adjustedThreshold;
  const shortageQty = isShortage ? Math.max(0, adjustedThreshold - quantity) : 0;

  return { isShortage, adjustedThreshold, shortageQty };
};

export const calculatePurchaseSuggestion = (
  consumptionData: ConsumptionData[],
  currentStock: number,
  thresholdSum: number,
  days: number = 30,
  safetyDays: number = 7
): PurchaseSuggestion | null => {
  if (consumptionData.length === 0) {
    return null;
  }

  const materialType = consumptionData[0].materialType;
  const totalConsumed = consumptionData.reduce((sum, item) => sum + item.consumed, 0);
  const avgDailyConsumption = Math.round((totalConsumed / days) * 100) / 100;

  if (avgDailyConsumption <= 0) {
    return null;
  }

  const availableDays = currentStock > 0 ? Math.floor(currentStock / avgDailyConsumption) : 0;
  const reorderPoint = Math.round(avgDailyConsumption * safetyDays);
  const suggestedQuantity = Math.max(
    thresholdSum,
    Math.round(avgDailyConsumption * (days / 2))
  );

  const today = dayjs();
  let suggestedDate: string;
  let reason: string;

  if (currentStock <= 0) {
    suggestedDate = today.format('YYYY-MM-DD');
    reason = '当前库存为0，需立即采购';
  } else if (availableDays <= safetyDays) {
    suggestedDate = today.format('YYYY-MM-DD');
    reason = `预计仅够使用${availableDays}天，低于安全库存天数${safetyDays}天`;
  } else if (currentStock <= reorderPoint) {
    suggestedDate = today.format('YYYY-MM-DD');
    reason = `当前库存${currentStock}已低于补货点${reorderPoint}`;
  } else {
    const daysUntilReorder = availableDays - safetyDays;
    suggestedDate = today.add(daysUntilReorder, 'day').format('YYYY-MM-DD');
    reason = `预计${daysUntilReorder}天后达到安全库存阈值，建议提前采购`;
  }

  return {
    materialType,
    currentStock,
    avgDailyConsumption,
    availableDays,
    suggestedQuantity,
    suggestedDate,
    reason,
  };
};

export const groupByCounter = <T extends { counterId: string }>(items: T[]): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    if (!acc[item.counterId]) {
      acc[item.counterId] = [];
    }
    acc[item.counterId].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const groupByMaterial = <T extends { materialType: MaterialType }>(
  items: T[]
): Record<MaterialType, T[]> => {
  return items.reduce((acc, item) => {
    if (!acc[item.materialType]) {
      acc[item.materialType] = [];
    }
    acc[item.materialType].push(item);
    return acc;
  }, {} as Record<MaterialType, T[]>);
};
