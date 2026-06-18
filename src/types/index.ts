export type CoatSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type CoatStatus = 'available' | 'in_use' | 'pending_cleaning' | 'cleaning' | 'repairing' | 'scrapped';
export type DamageLevel = 'none' | 'minor' | 'moderate' | 'severe';
export type LendingStatus = 'active' | 'returned' | 'overdue';
export type BatchStatus = 'cleaning' | 'completed';

export interface DamageStatus {
  hasStain: boolean;
  hasHole: boolean;
  missingButton: boolean;
  pocketResidue: boolean;
  contactHazard: boolean;
  stainLevel: DamageLevel;
  holeLevel: DamageLevel;
  buttonLevel: DamageLevel;
  lastCheckAt: string;
}

export interface LabCoat {
  id: string;
  code: string;
  size: CoatSize;
  lab: string;
  status: CoatStatus;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  lastCleaningBatchId?: string;
  damageStatus?: DamageStatus;
}

export interface Lending {
  id: string;
  coatId: string;
  studentName: string;
  studentId: string;
  course: string;
  teacher: string;
  experimentDate: string;
  expectedReturn: string;
  actualReturn?: string;
  status: LendingStatus;
  createdAt: string;
}

export interface DamageRecord {
  id: string;
  lendingId: string;
  hasStain: boolean;
  hasHole: boolean;
  missingButton: boolean;
  pocketResidue: boolean;
  contactHazard: boolean;
  stainLevel: DamageLevel;
  holeLevel: DamageLevel;
  buttonLevel: DamageLevel;
  notes?: string;
  photos: string[];
  needCleaning: boolean;
  needRepair: boolean;
  createdAt: string;
}

export interface CleaningBatch {
  id: string;
  batchNo: string;
  createdAt: string;
  completedAt?: string;
  status: BatchStatus;
  notes?: string;
  coatIds: string[];
}

export const COAT_STATUS_LABELS: Record<CoatStatus, string> = {
  available: '可领用',
  in_use: '使用中',
  pending_cleaning: '待清洗',
  cleaning: '清洗中',
  repairing: '维修中',
  scrapped: '已报废',
};

export const LENDING_STATUS_LABELS: Record<LendingStatus, string> = {
  active: '使用中',
  returned: '已归还',
  overdue: '已逾期',
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  cleaning: '清洗中',
  completed: '已完成',
};

export const DAMAGE_LEVEL_LABELS: Record<DamageLevel, string> = {
  none: '无',
  minor: '轻微',
  moderate: '中度',
  severe: '严重',
};

export const COAT_SIZES: CoatSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const LABORATORIES = [
  '化学实验室A',
  '化学实验室B',
  '生物实验室A',
  '生物实验室B',
  '物理实验室',
  '材料科学实验室',
  '环境工程实验室',
];
