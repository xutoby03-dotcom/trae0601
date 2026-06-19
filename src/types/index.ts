export interface Pitcher {
  id: string;
  name: string;
  brand: string;
  capacity: number;
  filterModel: string;
  userCount: number;
  location: string;
  photo: string;
  createdAt: string;
}

export interface FilterReplacement {
  id: string;
  pitcherId: string;
  installDate: string;
  batchNo: string;
  expectedLifeDays: number;
  flushCount: number;
  stockAfter: number;
  createdAt: string;
}

export interface WaterRefill {
  id: string;
  pitcherId: string;
  date: string;
  count: number;
  note?: string;
}

export type AlertType = 'slow_flow' | 'odor' | 'chlorine_test';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface WaterQualityAlert {
  id: string;
  pitcherId: string;
  type: AlertType;
  description: string;
  date: string;
  severity: AlertSeverity;
  resolved: boolean;
}

export interface FilterStock {
  id: string;
  filterModel: string;
  quantity: number;
  lastUpdated: string;
}

export type FilterStatus = 'healthy' | 'normal' | 'warning' | 'expired';

export interface DashboardStats {
  totalPitchers: number;
  healthyFilters: number;
  warningFilters: number;
  expiredFilters: number;
  lowStockCount: number;
  unresolvedAlerts: number;
  purchaseSuggestion: {
    needPurchase: boolean;
    suggestedQuantity: number;
    estimatedDaysLeft: number;
  };
  recentAlerts: WaterQualityAlert[];
  pitcherUsageStats: {
    pitcherId: string;
    pitcherName: string;
    refillCount: number;
  }[];
}

export interface ReplaceFilterData {
  installDate: string;
  batchNo: string;
  expectedLifeDays: number;
  flushCount: number;
}
