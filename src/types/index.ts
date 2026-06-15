export type BatchStatus = 'brewing' | 'ready' | 'overdue' | 'filtered' | 'off_shelf';

export interface Tea {
  id: string;
  name: string;
  brewDurationMinutes: number;
  teaToWaterRatio: number;
  shelfLifeHours: number;
  color: string;
  icon: string;
}

export interface Batch {
  id: string;
  teaId: string;
  bucketNumber: number;
  waterAmountMl: number;
  teaAmountG: number;
  startTime: string;
  targetFilterTime: string;
  operator: string;
  photoUrl: string;
  status: BatchStatus;
  actualFilterTime?: string;
  outputAmountMl?: number;
  tasteRating?: number;
  lossAmountMl?: number;
  lossReason?: string;
  shelfLocation?: string;
  shelfTime?: string;
  offShelfTime?: string;
  isOffShelf: boolean;
  offShelfReason?: string;
}

export interface BatchFormData {
  teaId: string;
  bucketNumber: number;
  waterAmountMl: number;
  teaAmountG: number;
  startTime: string;
  operator: string;
  photoUrl: string;
}

export interface FilterFormData {
  outputAmountMl: number;
  tasteRating: number;
  lossAmountMl: number;
  lossReason: string;
  shelfLocation: string;
}

export interface StatisticsData {
  totalBatches: number;
  avgOutputRate: number;
  overdueCount: number;
  lossRate: number;
  teaStats: TeaStatItem[];
  lossReasons: LossReasonItem[];
  brewSuggestions: BrewSuggestion[];
}

export interface TeaStatItem {
  teaId: string;
  teaName: string;
  color: string;
  avgOutputRate: number;
  batchCount: number;
  stdDev: number;
}

export interface LossReasonItem {
  reason: string;
  count: number;
  amount: number;
}

export interface BrewSuggestion {
  time: string;
  teas: { teaId: string; teaName: string; count: number; color: string }[];
}

export type FilterStatus = 'all' | 'brewing' | 'ready' | 'filtered' | 'off_shelf';
