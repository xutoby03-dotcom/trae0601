export type ProductionStatus = 'pending' | 'approved' | 'rejected';

export type FeelLevel = 1 | 2 | 3;

export type ProblemType = 'pattern' | 'fabric' | 'workmanship' | 'comfort';

export type SizeCode = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Sample {
  id: string;
  styleNo: string;
  version: string;
  fabric: string;
  sizes: SizeCode[];
  targetGroup: string;
  sampleDate: string;
  photos: string[];
  previousVersionId?: string;
  productionStatus: ProductionStatus;
  productionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  sampleId: string;
  wearerName: string;
  height: number;
  weight: number;
  usualSize: SizeCode;
  trySize: SizeCode;
  shoulderFeel: FeelLevel;
  chestFeel: FeelLevel;
  waistFeel: FeelLevel;
  shoulderNote?: string;
  chestNote?: string;
  waistNote?: string;
  limitedActions: string[];
  problemTypes: ProblemType[];
  problemDescription?: string;
  suggestions: string[];
  photos: string[];
  createdAt: string;
}

export const ProblemTypeLabel: Record<ProblemType, string> = {
  pattern: '版型问题',
  fabric: '面料问题',
  workmanship: '做工问题',
  comfort: '舒适度问题',
};

export const FeelLabel: Record<FeelLevel, string> = {
  1: '太紧',
  2: '合适',
  3: '太松',
};
