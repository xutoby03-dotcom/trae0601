export interface Cat {
  id: string;
  name: string;
  age: number;
  weight: number;
  diet: string;
  healthNotes: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface LitterBox {
  id: string;
  location: string;
  size: string;
  litterType: string;
  cleaningFrequency: number;
  deodorizer: string;
  fullChangeInterval: number;
  lastFullChangeDate: string;
  createdAt: string;
  updatedAt: string;
}

export type OperationType = 'scoop' | 'add_litter' | 'full_change' | 'disinfect';

export type OdorLevel = 'none' | 'mild' | 'moderate' | 'severe';

export type ClumpCondition = 'normal' | 'loose' | 'small' | 'large';

export type AbnormalType = 'blood_urine' | 'abnormal_stool' | 'small_clumps' | 'no_stool_days';

export type ObservationStatus = 'watching' | 'recovered' | 'need_vet';

export interface CleaningRecord {
  id: string;
  litterBoxId: string;
  catId?: string;
  date: string;
  time: string;
  operator: string;
  operationTypes: OperationType[];
  litterAdded: number;
  odorLevel: OdorLevel;
  clumpCondition: ClumpCondition;
  hasBloodUrine: boolean;
  hasAbnormalStool: boolean;
  hasSmallClumps: boolean;
  noStoolForDays: boolean;
  isAbnormal: boolean;
  abnormalTypes: AbnormalType[];
  notes: string;
  createdAt: string;
}

export interface ObservationNote {
  id: string;
  recordId: string;
  catId?: string;
  abnormalType: AbnormalType;
  content: string;
  status: ObservationStatus;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  todayPending: number;
  abnormalCount: number;
  litterStock: number;
  nextFullChangeDays: number;
  nextFullChangeBoxName: string;
}

export const OPERATION_LABELS: Record<OperationType, string> = {
  scoop: '铲屎',
  add_litter: '补砂',
  full_change: '整盆换砂',
  disinfect: '消毒',
};

export const ODOR_LABELS: Record<OdorLevel, string> = {
  none: '无异味',
  mild: '轻微',
  moderate: '明显',
  severe: '严重',
};

export const CLUMP_LABELS: Record<ClumpCondition, string> = {
  normal: '正常',
  loose: '松散',
  small: '过小',
  large: '过大',
};

export const ABNORMAL_LABELS: Record<AbnormalType, string> = {
  blood_urine: '血尿',
  abnormal_stool: '排便异常',
  small_clumps: '尿团过小',
  no_stool_days: '多天未排便',
};

export const OBSERVATION_STATUS_LABELS: Record<ObservationStatus, string> = {
  watching: '观察中',
  recovered: '已恢复',
  need_vet: '需就医',
};
