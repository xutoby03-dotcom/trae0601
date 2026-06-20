export type RiskLevel = 'low' | 'medium' | 'high';
export type CheckStatus = 'pass' | 'warning' | 'fail' | 'untested';
export type PurchaseRecommendation = 'buy' | 'caution' | 'avoid';
export type SampleType = 'center' | 'corner_tl' | 'corner_tr' | 'corner_bl' | 'corner_br' | 'vignetting';
export type CheckCategory = 'appearance' | 'optics' | 'aperture' | 'af' | 'extreme_focus' | 'samples';

export interface LensInfo {
  id: string;
  brand: string;
  model: string;
  mount: string;
  sellerPrice: number;
  condition: string;
  purchaseChannel: string;
  notes: string;
  createdAt: string;
}

export interface CheckItem {
  id: string;
  category: CheckCategory;
  itemName: string;
  description: string;
  status: CheckStatus;
  notes: string;
}

export interface SamplePhoto {
  id: string;
  aperture: string;
  type: SampleType;
  imageData: string;
  orderIndex: number;
}

export interface RiskTag {
  id: string;
  name: string;
  level: RiskLevel;
  description: string;
  priceImpact: number;
}

export interface EvaluationReport {
  recommendation: PurchaseRecommendation;
  minPrice: number;
  maxPrice: number;
  fairPrice: number;
  bargainReasons: string[];
  overallScore: number;
  summary: string;
}

export interface Inspection {
  id: string;
  lensInfo: LensInfo;
  checkItems: CheckItem[];
  samplePhotos: SamplePhoto[];
  riskTags: RiskTag[];
  currentStep: number;
  report?: EvaluationReport;
}

export interface InspectionSummary {
  id: string;
  brand: string;
  model: string;
  sellerPrice: number;
  createdAt: string;
  recommendation?: PurchaseRecommendation;
  overallScore?: number;
  riskCount: { high: number; medium: number; low: number };
}
