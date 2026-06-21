export interface Snowboard {
  id: string;
  name: string;
  brand: string;
  model: string;
  length: number;
  type: 'freeride' | 'freestyle' | 'all-mountain' | 'carving' | 'powder';
  createdAt: string;
  notes?: string;
}

export type SnowCondition = 'ice' | 'hardpack' | 'groomed' | 'powder' | 'slush' | 'crud';

export type WaxType = 'warm' | 'universal' | 'cold' | 'fluorocarbon';

export interface TuneRecord {
  id: string;
  boardId: string;
  baseEdgeAngle: number;
  sideEdgeAngle: number;
  waxTemp: number;
  waxType: WaxType;
  snowCondition: SnowCondition;
  snowTemp: number;
  date: string;
  location: string;
  notes?: string;
}

export interface RideFeedback {
  id: string;
  tuneRecordId: string;
  boardId: string;
  date: string;
  runs: number;
  gripScore: number;
  edgeChangeScore: number;
  chatterScore: number;
  speedLossScore: number;
  overallScore: number;
  notes?: string;
}

export interface RecommendationEvidence {
  matchedTune: TuneRecord;
  tempDiff: number;
  feedbackCount: number;
  avgGrip: number;
  avgEdgeChange: number;
  avgChatter: number;
  avgSpeedLoss: number;
  avgEffectiveScore: number;
}

export interface Recommendation {
  snowCondition: SnowCondition;
  snowTempRange: [number, number];
  baseEdgeAngle: number;
  sideEdgeAngle: number;
  waxTemp: number;
  waxType: WaxType;
  confidence: number;
  reasoning: string;
  evidence?: RecommendationEvidence;
  hasHistoricalData: boolean;
}

export const SNOW_CONDITION_LABELS: Record<SnowCondition, string> = {
  ice: '冰面',
  hardpack: '硬雪',
  groomed: '机压雪道',
  powder: '粉雪',
  slush: '雪泥',
  crud: '烂雪',
};

export const WAX_TYPE_LABELS: Record<WaxType, string> = {
  warm: '温蜡',
  universal: '通用蜡',
  cold: '冷蜡',
  fluorocarbon: '氟蜡',
};

export const BOARD_TYPE_LABELS: Record<Snowboard['type'], string> = {
  freeride: '野雪',
  freestyle: '自由式',
  'all-mountain': '全地域',
  carving: '刻滑',
  powder: '粉雪板',
};
