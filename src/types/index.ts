export type SoupType = 'pork-bone' | 'beef-bone' | 'chicken' | 'seafood' | 'vegetarian';

export const SOUP_TYPES: SoupType[] = ['pork-bone', 'beef-bone', 'chicken', 'seafood', 'vegetarian'];
export type FireLevel = 'low' | 'medium' | 'high' | 'simmer';
export type BatchStatus = 'preparing' | 'cooking' | 'finished' | 'sold';
export type FeedbackType = 'too-salty' | 'too-light' | 'oily' | 'other';
export type Severity = 'mild' | 'moderate' | 'serious';
export type SkimStatus = 'not-done' | 'partial' | 'thorough';

export interface Batch {
  id: string;
  soupType: SoupType;
  boneWeightKg: number;
  waterVolumeL: number;
  spicePack: string;
  startTime: string;
  fireLevel: FireLevel;
  targetYieldL: number;
  potNumber: string;
  potPhoto?: string;
  status: BatchStatus;
  finishTime?: string;
  operator: string;
  cookingRecords: CookingRecord[];
  saleWindow?: SaleWindow;
}

export interface CookingRecord {
  id: string;
  batchId: string;
  recordTime: string;
  temperature: number;
  salinity: number;
  waterAddedL: number;
  skimStatus: SkimStatus;
  tasteComment: string;
}

export interface SaleWindow {
  id: string;
  batchId: string;
  windowName: string;
  saleDate: string;
  remainingL: number;
}

export interface CustomerFeedback {
  id: string;
  windowId?: string;
  batchId: string;
  feedbackType: FeedbackType;
  severity: Severity;
  remark: string;
  createdAt: string;
}
