export type ProcessMethod = '水洗' | '日晒' | '蜜处理' | '厌氧';

export type RoastLevel = '浅烘' | '中浅烘' | '中烘' | '中深烘' | '深烘';

export type FlavorStatus = 'resting' | 'best' | 'nearExpiry' | 'expired';

export type WasteType = '试机' | '撒漏' | '校磨';

export interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  processMethod: ProcessMethod;
  roastLevel: RoastLevel;
  roastDate: string;
  restDays: number;
  bestFlavorDays: number;
  totalWeight: number;
  remainingWeight: number;
  isTodayPick: boolean;
  recommendationOrder: number;
  createdAt: string;
}

export interface Grinder {
  id: string;
  name: string;
  beanId: string | null;
  lastUsed: string | null;
}

export interface WasteRecord {
  id: string;
  beanId: string;
  wasteType: WasteType;
  weight: number;
  note?: string;
  createdAt: string;
}

export interface DailyConsumption {
  date: string;
  beanId: string;
  weight: number;
}
