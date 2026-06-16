export type Salinity = 'low' | 'normal' | 'high';
export type SoupColor = 'light' | 'normal' | 'dark';
export type PotStatus = 'normal' | 'warning' | 'danger';
export type TasteResult = 'light' | 'salty' | 'weak' | 'normal';
export type ItemName = '鸭脖' | '鸡爪' | '豆干';

export interface CookingRecord {
  id: string;
  potId: string;
  timestamp: string;
  operator: string;
  waterAmount: number;
  saltAmount: number;
  sugarAmount: number;
  spicePackCount: number;
  stockAmount: number;
  tasteResult: TasteResult;
  remark?: string;
}

export interface ProductionBatch {
  id: string;
  potId: string;
  itemName: ItemName;
  quantity: number;
  outTime: string;
  operator: string;
  hasComplaint: boolean;
}

export interface Complaint {
  id: string;
  batchId: string;
  potId: string;
  complaintType: string;
  description: string;
  timestamp: string;
}

export interface Pot {
  id: string;
  name: string;
  soupLevel: number;
  salinity: Salinity;
  color: SoupColor;
  needSkim: boolean;
  todayItems: string[];
  continuousUseHours: number;
  status: PotStatus;
  lastCleanDate: string;
  spicePackCount: number;
  cookingRecords: CookingRecord[];
  productionBatches: ProductionBatch[];
  complaints: Complaint[];
}

export interface SpiceRankingItem {
  potId: string;
  potName: string;
  count: number;
}

export interface CleanScheduleItem {
  potId: string;
  potName: string;
  lastCleanDate: string;
  recommendedCleanDate: string;
  daysUntilClean: number;
}

export interface TasteTrendItem {
  date: string;
  normal: number;
  light: number;
  salty: number;
  weak: number;
}

export interface StatisticsData {
  spiceRanking: SpiceRankingItem[];
  cleanSchedule: CleanScheduleItem[];
  tasteTrend: TasteTrendItem[];
}
