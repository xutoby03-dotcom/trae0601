export type StorageUnit = 'g' | 'kg' | 'ml' | 'L' | 'pcs';

export type SealingMethod = '保鲜袋' | '密封罐' | '保鲜膜' | '原包装封口' | '真空包装';

export type FreezerLocation = '冷藏柜A' | '冷藏柜B' | '冷冻柜A' | '冷冻柜B' | '常温货架' | '阴凉处';

export type DiscardReason = '开封超期' | '储存温度不符' | '剩余量不足' | '外观异常' | '气味异常' | '发霉' | '其他';

export interface Ingredient {
  id: string;
  name: string;
  brand: string;
  batch: string;
  unopenedShelfLifeDays: number;
  openedDays: number;
  storageTempMin: number;
  storageTempMax: number;
  photo?: string;
  totalWeight: number;
  unit: StorageUnit;
  lowStockThreshold: number;
  createdAt: string;
}

export interface OpenRecord {
  id: string;
  ingredientId: string;
  operator: string;
  openDate: string;
  remainingWeight: number;
  sealingMethod: SealingMethod;
  freezerLocation: FreezerLocation;
  actualTemp?: number;
  isDiscarded: boolean;
  discardReason?: DiscardReason;
  discardDate?: string;
  discardOperator?: string;
  discardNote?: string;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  openRecordId: string;
  ingredientId: string;
  amount: number;
  productBatch: string;
  resealed: boolean;
  operator: string;
  usageDate: string;
  note?: string;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  type: 'expired' | 'temp' | 'lowStock';
  level: 'warning' | 'danger';
  title: string;
  description: string;
  ingredientId: string;
  openRecordId?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface DailyUsage {
  date: string;
  ingredientId: string;
  ingredientName: string;
  totalUsed: number;
  unit: StorageUnit;
}

export interface PurchaseSuggestion {
  ingredientId: string;
  ingredientName: string;
  brand: string;
  currentStock: number;
  unit: StorageUnit;
  avgDailyUsage: number;
  daysLeft: number;
  suggestedQuantity: number;
  urgency: 'low' | 'medium' | 'high';
}
