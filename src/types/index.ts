export interface CleaningItem {
  id: string;
  name: string;
  category: ItemCategory;
  room: string;
  material: string;
  lastCleanDate: string;
  suggestedCycleDays: number;
  canMachineWash: boolean;
  photos: string[];
  notes: string;
  createdAt: string;
}

export type ItemCategory = 'curtain' | 'carpet' | 'sofaCover' | 'acFilter' | 'other';

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  curtain: '窗帘',
  carpet: '地毯',
  sofaCover: '沙发套',
  acFilter: '空调滤网',
  other: '其他',
};

export interface CleaningPlan {
  id: string;
  itemId: string;
  status: PlanStatus;
  steps: CleaningStep[];
  cost: number;
  startDate: string;
  endDate?: string;
  notes: string;
}

export type PlanStatus = 'pending' | 'inProgress' | 'drying' | 'completed';

export const STATUS_LABELS: Record<PlanStatus, string> = {
  pending: '已预约',
  inProgress: '清洗中',
  drying: '晾晒中',
  completed: '已完成',
};

export interface CleaningStep {
  id: string;
  type: StepType;
  scheduledDate: string;
  completedDate?: string;
  isCompleted: boolean;
  notes?: string;
}

export type StepType = 'disassemble' | 'sendWash' | 'pickup' | 'install' | 'dry';

export const STEP_LABELS: Record<StepType, string> = {
  disassemble: '拆卸',
  sendWash: '送洗',
  pickup: '取回',
  install: '安装',
  dry: '晾晒',
};

export type ItemStatusGroup = 'needClean' | 'scheduled' | 'drying' | 'completed';

export const GROUP_LABELS: Record<ItemStatusGroup, string> = {
  needClean: '快该洗',
  scheduled: '已预约',
  drying: '晾晒中',
  completed: '已完成',
};

export interface RoomStat {
  room: string;
  itemCount: number;
  cleanCount: number;
  totalCost: number;
}

export interface YearlyStat {
  month: string;
  cost: number;
  count: number;
}
