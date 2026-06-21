export type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';
export type BlindCode = 'A' | 'B' | 'C';
export type Priority = 'high' | 'medium' | 'low';
export type Step = 'create' | 'brewing' | 'tasting' | 'reveal';

export interface WaterSample {
  id: string;
  blindCode: BlindCode;
  realName: string;
  tds: number;
  hardness: number;
  ph: number;
  mineralNotes: string;
}

export interface BrewingParam {
  id: string;
  waterSampleId: string;
  grindSize: number;
  waterTemp: number;
  coffeeDose: number;
  waterAmount: number;
  brewTime: number;
  pourMethod: string;
}

export interface TastingScore {
  id: string;
  waterSampleId: string;
  acidity: number;
  sweetness: number;
  bitterness: number;
  aftertaste: number;
  cleanliness: number;
  preferenceRank: number;
  flavorTags: string[];
  notes: string;
}

export interface BlindTest {
  id: string;
  coffeeName: string;
  origin: string;
  processMethod: string;
  roastLevel: RoastLevel;
  roastDate: string;
  createdAt: string;
  isRevealed: boolean;
  waterSamples: WaterSample[];
  brewingParams: BrewingParam[];
  tastingScores: TastingScore[];
}

export interface Suggestion {
  title: string;
  description: string;
  icon: string;
  priority: Priority;
}

export interface RadarDataPoint {
  dimension: string;
  [key: string]: string | number;
}

export const ROAST_LEVELS: { value: RoastLevel; label: string }[] = [
  { value: 'light', label: '浅烘焙' },
  { value: 'medium', label: '中烘焙' },
  { value: 'medium-dark', label: '中深烘焙' },
  { value: 'dark', label: '深烘焙' },
];

export const POUR_METHODS = [
  '三段式注水',
  '中心注水',
  '螺旋注水',
  '点滴法',
  '一次性注水',
  '其他',
];

export const FLAVOR_TAGS = [
  '花香', '柑橘', '莓果', '核果', '热带水果',
  '焦糖', '蜂蜜', '黑糖', '巧克力', '坚果',
  '烘焙', '香料', '草本', '木质', '烟熏',
  '茶感', '发酵', '酒香', '奶油', '香草',
];

export const RATING_DIMENSIONS = [
  { key: 'acidity', label: '酸质', color: '#2E7D32' },
  { key: 'sweetness', label: '甜感', color: '#F57F17' },
  { key: 'bitterness', label: '苦感', color: '#424242' },
  { key: 'aftertaste', label: '余韵', color: '#6A1B9A' },
  { key: 'cleanliness', label: '干净度', color: '#0277BD' },
] as const;

export const STEPS: { key: Step; label: string }[] = [
  { key: 'create', label: '创建盲测' },
  { key: 'brewing', label: '冲煮记录' },
  { key: 'tasting', label: '杯测评分' },
  { key: 'reveal', label: '揭晓对比' },
];
