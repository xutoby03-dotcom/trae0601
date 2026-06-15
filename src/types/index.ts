export type FoodCategory = 'fruit' | 'snack' | 'beverage';

export type AllergenType = 'nuts' | 'dairy' | 'gluten' | 'seafood' | 'soy';

export type FoodStatus = 'available' | 'partially_claimed' | 'fully_claimed' | 'expired' | 'disposed';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  remaining: number;
  isOpened: boolean;
  allergens: AllergenType[];
  meetingRoom: string;
  department: string;
  endTime: string;
  edibleHours: number;
  photoUrl: string;
  description: string;
  status: FoodStatus;
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  foodId: string;
  foodName: string;
  department: string;
  quantity: number;
  pickupTime: string;
  claimerName: string;
  createdAt: string;
}

export interface DisposalRecord {
  id: string;
  foodId: string;
  foodName: string;
  reason: 'expired' | 'unclaimed';
  quantity: number;
  disposedAt: string;
}

export interface StatsData {
  totalAvailable: number;
  safeToTakeToday: number;
  todayClaimed: number;
  topWasteDepartments: { department: string; count: number }[];
  commonlyUnclaimed: { name: string; count: number }[];
}

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  fruit: '水果',
  snack: '点心',
  beverage: '饮料',
};

export const ALLERGEN_LABELS: Record<AllergenType, string> = {
  nuts: '坚果',
  dairy: '乳制品',
  gluten: '麸质',
  seafood: '海鲜',
  soy: '大豆',
};

export const DEPARTMENTS = [
  '技术部',
  '产品部',
  '设计部',
  '市场部',
  '运营部',
  '人力资源部',
  '财务部',
  '行政部',
  '销售部',
  '法务部',
];

export const MEETING_ROOMS = [
  'A101-创新厅',
  'A102-协作室',
  'A201-董事会议室',
  'B101-培训室',
  'B201-头脑风暴室',
  'C101-多功能厅',
  'C201-视频会议室',
  'D101-小会议室',
];
