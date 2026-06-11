export interface Seasoning {
  id: string;
  name: string;
  brand: string;
  category: string;
  openDate: string;
  shelfLifeDays: number;
  location: string;
  initialAmount: number;
  currentAmount: number;
  unit: string;
  photoUrl?: string;
  restockThreshold: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'expired' | 'restocked';
  price?: number;
}

export interface UsageRecord {
  id: string;
  seasoningId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface WasteRecord {
  id: string;
  seasoningId: string;
  seasoningName: string;
  seasoningBrand: string;
  category: string;
  wastedAmount: number;
  unit: string;
  reason: string;
  date: string;
  price?: number;
}

export type SeasoningStatusFilter = 'all' | 'fresh' | 'soon' | 'expired' | 'restock';

export type SeasoningCategory = 
  | '酱油/调味汁'
  | '酱料/火锅底料'
  | '香料/干货'
  | '醋/料酒'
  | '糖/盐/味精'
  | '咖喱/块装调料'
  | '其他';

export const CATEGORIES: SeasoningCategory[] = [
  '酱油/调味汁',
  '酱料/火锅底料',
  '香料/干货',
  '醋/料酒',
  '糖/盐/味精',
  '咖喱/块装调料',
  '其他',
];

export const UNITS = ['g', 'ml', '勺', '块', '袋', '瓶'];

export const LOCATIONS = [
  '厨房柜子',
  '冰箱冷藏',
  '冰箱冷冻',
  '灶台旁',
  '餐桌',
  '其他',
];
