export type FoodStatus = 'tonight' | 'expiring' | 'frozen' | 'processed';

export type ProcessType = 'eaten' | 'discarded' | 'transformed';

export interface FoodRecord {
  id: string;
  name: string;
  cookDate: string;
  location: string;
  expectedDays: number;
  suitableFor: string[];
  canReheat: boolean;
  photo?: string;
  createdAt: string;
  status: FoodStatus;
  isFrozen: boolean;
  processInfo?: ProcessInfo;
}

export interface ProcessInfo {
  type: ProcessType;
  reason: string;
  date: string;
}

export interface FoodStats {
  mostWasted: { name: string; count: number }[];
  avgStorageDays: number;
  mostLeftoverDay: { date: string; count: number }[];
  totalCount: number;
  eatenCount: number;
  discardedCount: number;
  transformedCount: number;
}

export const STATUS_LABELS: Record<FoodStatus, string> = {
  tonight: '今晚先吃',
  expiring: '快坏了',
  frozen: '冷冻中',
  processed: '已经处理'
};

export const STATUS_COLORS: Record<FoodStatus, string> = {
  tonight: '#FF7A45',
  expiring: '#FFC107',
  frozen: '#74B9FF',
  processed: '#636E72'
};

export const PROCESS_LABELS: Record<ProcessType, string> = {
  eaten: '吃掉',
  discarded: '倒掉',
  transformed: '改造成新菜'
};
