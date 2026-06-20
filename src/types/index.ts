export type PaintStage = 'primer' | 'masking' | 'painting' | 'panel-lining' | 'weathering' | 'completed';

export type StageStatus = 'pending' | 'active' | 'completed';

export type ShelfReason = 'touch-up' | 'parts-missing' | 'replan' | 'other';

export interface Model {
  id: string;
  name: string;
  scale: string;
  thumbnail: string;
  currentStage: PaintStage;
  nextAction: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  isOnShelf: boolean;
  shelfReason?: ShelfReason;
  staleDays: number;
}

export interface Stage {
  id: string;
  modelId: string;
  name: PaintStage;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface PaintFormula {
  id: string;
  modelId: string;
  stageId: string;
  brand: string;
  code: string;
  color: string;
  dilutionRatio: string;
  usedOn: string;
  notes?: string;
}

export interface Photo {
  id: string;
  modelId: string;
  stageId: string;
  data: string;
  caption: string;
  createdAt: string;
}

export interface DryingTimer {
  id: string;
  modelId: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  startTime?: string;
}

export interface RootState {
  models: Model[];
  stages: Stage[];
  formulas: PaintFormula[];
  photos: Photo[];
  timers: DryingTimer[];
}

export const STAGE_ORDER: PaintStage[] = ['primer', 'masking', 'painting', 'panel-lining', 'weathering', 'completed'];

export const STAGE_NAMES: Record<PaintStage, string> = {
  'primer': '底漆',
  'masking': '遮盖',
  'painting': '上色',
  'panel-lining': '渗线',
  'weathering': '旧化',
  'completed': '完成'
};

export const STAGE_COLORS: Record<PaintStage, string> = {
  'primer': '#6B7280',
  'masking': '#3B82F6',
  'painting': '#D97706',
  'panel-lining': '#1F2937',
  'weathering': '#92400E',
  'completed': '#4D7C5E'
};

export const SHELF_REASON_NAMES: Record<ShelfReason, string> = {
  'touch-up': '需要补漆',
  'parts-missing': '缺少补件',
  'replan': '重新规划',
  'other': '其他原因'
};
