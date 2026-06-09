export type RiskLevel = 'low' | 'medium' | 'high';

export type WaterSource = 'none' | 'stream' | 'lake' | 'tap';

export type ToiletType = 'none' | 'simple' | 'standard';

export type PhoneSignal = 'none' | 'weak' | 'medium' | 'strong';

export type ColdLevel = 'none' | 'mild' | 'severe';

export interface Camp {
  id: string;
  name: string;
  location: string;
  altitude: number;
  waterSource: WaterSource;
  toilet: ToiletType;
  parkingDistance: number;
  fireAllowed: boolean;
  phoneSignal: PhoneSignal;
  photos: string[];
  overallRiskLevel: number;
  createdAt: number;
  updatedAt: number;
}

export interface RiskAssessment {
  id: string;
  campId: string;
  weatherRisk: RiskLevel;
  windRisk: RiskLevel;
  rockfallRisk: RiskLevel;
  floodRisk: RiskLevel;
  insectRisk: RiskLevel;
  wildDogRisk: RiskLevel;
  lightingRisk: RiskLevel;
  escapeRisk: RiskLevel;
  createdAt: number;
}

export interface Experience {
  id: string;
  campId: string;
  coldLevel: ColdLevel;
  hasWaterPooling: boolean;
  noisyNeighbors: boolean;
  rating: number;
  notes: string;
  date: number;
  createdAt: number;
}

export interface PrepItem {
  icon: string;
  title: string;
  description: string;
  category: 'essential' | 'safety' | 'comfort';
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export const WATER_SOURCE_LABELS: Record<WaterSource, string> = {
  none: '无',
  stream: '溪流',
  lake: '湖泊',
  tap: '自来水',
};

export const TOILET_LABELS: Record<ToiletType, string> = {
  none: '无',
  simple: '简易',
  standard: '标准',
};

export const PHONE_SIGNAL_LABELS: Record<PhoneSignal, string> = {
  none: '无信号',
  weak: '弱',
  medium: '中',
  strong: '强',
};

export const COLD_LEVEL_LABELS: Record<ColdLevel, string> = {
  none: '不冷',
  mild: '有点冷',
  severe: '很冷',
};

export const RISK_ITEM_KEYS = [
  'weatherRisk',
  'windRisk',
  'rockfallRisk',
  'floodRisk',
  'insectRisk',
  'wildDogRisk',
  'lightingRisk',
  'escapeRisk',
] as const;

export type RiskItemKey = (typeof RISK_ITEM_KEYS)[number];

export const RISK_ITEM_LABELS: Record<RiskItemKey, string> = {
  weatherRisk: '天气多变',
  windRisk: '强风',
  rockfallRisk: '落石风险',
  floodRisk: '涨水风险',
  insectRisk: '蚊虫多',
  wildDogRisk: '野狗出没',
  lightingRisk: '夜间照明不足',
  escapeRisk: '逃生路线不清',
};

export const RISK_SCORE: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};
