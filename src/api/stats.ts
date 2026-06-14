import { api } from './client';
import type { AlertItem, PurchaseSuggestion } from '../types';

export interface OverviewData {
  ingredientCount: number;
  activeOpenCount: number;
  discardedCount: number;
  todayUsageCount: number;
  todayUsageTypes: number;
  overallLossRate: number;
}

export interface ExpiringSoonItem {
  id: string;
  ingredientId: string;
  operator: string;
  openDate: string;
  remainingWeight: number;
  sealingMethod: string;
  freezerLocation: string;
  actualTemp: number | null;
  daysLeft: number;
  ingredient: {
    id: string;
    name: string;
    brand: string;
    batch: string;
    openedDays: number;
    unit: string;
  };
}

export interface DiscardStat {
  reason: string;
  count: number;
  weight: number;
}

export interface LossRateItem {
  id: string;
  name: string;
  totalDiscarded: number;
  totalOpened: number;
  lossRate: number;
}

export interface DailyUsageItem {
  date: string;
  ingredientId: string;
  ingredientName: string;
  totalUsed: number;
  unit: string;
}

export const statsApi = {
  overview: () => api.get<OverviewData>('/stats/overview'),
  alerts: () => api.get<AlertItem[]>('/stats/alerts'),
  expiringSoon: (days?: number) =>
    api.get<ExpiringSoonItem[]>(`/stats/expiring-soon${days ? `?days=${days}` : ''}`),
  discardStats: () => api.get<DiscardStat[]>('/stats/discard-stats'),
  purchaseSuggestions: () => api.get<PurchaseSuggestion[]>('/stats/purchase-suggestions'),
  lossRates: () => api.get<LossRateItem[]>('/stats/loss-rates'),
  dailyUsage: (days?: number) =>
    api.get<DailyUsageItem[]>(`/stats/daily-usage${days ? `?days=${days}` : ''}`),
};

export default statsApi;
