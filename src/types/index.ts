export type FlavorTag =
  | 'sour'
  | 'sweet'
  | 'bitter'
  | 'nutty'
  | 'floral'
  | 'fruity'
  | 'chocolate'
  | 'caramel';

export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

export type ProcessMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'wet-hulled';

export type StockStatus = 'normal' | 'low' | 'empty';

export interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  processMethod: ProcessMethod;
  roastLevel: RoastLevel;
  purchaseDate: string;
  price: number;
  initialWeight: number;
  remainingWeight: number;
  lowStockThreshold: number;
  recommendedGrind: string;
  photoUrl: string;
  flavorTags: FlavorTag[];
  createdAt: string;
  updatedAt: string;
}

export interface BrewRecord {
  id: string;
  beanId: string;
  brewTime: string;
  equipment: string;
  coffeeDose: number;
  waterAmount: number;
  waterTemp: number;
  brewTimeSec: number;
  rating: number;
  notes: string;
  flavorTags: FlavorTag[];
}

export interface Statistics {
  totalBeans: number;
  totalBrews: number;
  lowStockCount: number;
  favoriteOrigin: string;
  topValueBeans: Array<{
    bean: CoffeeBean;
    avgRating: number;
    pricePerGram: number;
    valueScore: number;
  }>;
  originDistribution: Array<{ origin: string; count: number; brewCount: number }>;
  commonEquipment: Array<{ equipment: string; count: number }>;
  commonRatio: string;
  commonTemp: number;
}

export const FLAVOR_TAG_LABELS: Record<FlavorTag, string> = {
  sour: '酸',
  sweet: '甜',
  bitter: '苦',
  nutty: '坚果',
  floral: '花香',
  fruity: '水果',
  chocolate: '巧克力',
  caramel: '焦糖',
};

export const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  light: '浅烘',
  'medium-light': '中浅烘',
  medium: '中烘',
  'medium-dark': '中深烘',
  dark: '深烘',
};

export const PROCESS_METHOD_LABELS: Record<ProcessMethod, string> = {
  washed: '水洗',
  natural: '日晒',
  honey: '蜜处理',
  anaerobic: '厌氧发酵',
  'wet-hulled': '湿刨法',
};
