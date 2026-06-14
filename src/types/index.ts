export type ACStatus = 'pending' | 'drying' | 'completed' | 'overdue';

export type DustLevel = 'light' | 'medium' | 'heavy';

export type DryingStatus = 'not_dried' | 'drying' | 'dried';

export interface AirConditioner {
  id: string;
  room: string;
  brand: string;
  model: string;
  horsepower: number;
  filterType: string;
  cleaningCycle: number;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CleaningRecord {
  id: string;
  acId: string;
  cleaner: string;
  removedAt: string;
  dustLevel: DustLevel;
  dryingStatus: DryingStatus;
  installedBackAt?: string;
  ventWiped: boolean;
  notes?: string;
  createdAt: string;
}

export interface ACWithStatus extends AirConditioner {
  status: ACStatus;
  lastCleanDate?: string;
  daysSinceLastClean: number;
  nextCleanDate: string;
  latestRecord?: CleaningRecord;
}

export interface DashboardStats {
  monthlyCleanCount: number;
  dirtiestRoom: { room: string; count: number; dustLevel: DustLevel };
  nextPriority: {
    ac: AirConditioner;
    daysOverdue: number;
    status: ACStatus;
  };
  statusCounts: {
    pending: number;
    drying: number;
    completed: number;
    overdue: number;
  };
}

export interface ACFormData {
  room: string;
  brand: string;
  model: string;
  horsepower: number;
  filterType: string;
  cleaningCycle: number;
  photo: string;
}

export interface CleaningRecordFormData {
  cleaner: string;
  removedAt: string;
  dustLevel: DustLevel;
  dryingStatus: DryingStatus;
  installedBackAt?: string;
  ventWiped: boolean;
  notes?: string;
}

export const STATUS_LABELS: Record<ACStatus, string> = {
  pending: '待清洗',
  drying: '晾干中',
  completed: '已完成',
  overdue: '已超期',
};

export const DUST_LEVEL_LABELS: Record<DustLevel, string> = {
  light: '轻微',
  medium: '中等',
  heavy: '严重',
};

export const DRYING_STATUS_LABELS: Record<DryingStatus, string> = {
  not_dried: '未晾干',
  drying: '晾干中',
  dried: '已晾干',
};

export const FILTER_TYPES = [
  'HEPA滤网',
  '活性炭滤网',
  '静电滤网',
  '普通滤网',
  '银离子滤网',
  '复合滤网',
];

export const BRANDS = [
  '格力',
  '美的',
  '海尔',
  '奥克斯',
  '小米',
  '海信',
  '科龙',
  '大金',
  '三菱',
  '松下',
];
