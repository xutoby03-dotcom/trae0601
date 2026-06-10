export type ToyStatus = 'playing' | 'stored' | 'cleaning' | 'giving' | 'away';
export type ToyTag = 'rainy' | 'parent-child' | 'quiet';
export type RotationAction = 'take-out' | 'put-back';

export interface Toy {
  id: string;
  name: string;
  ageRange: string;
  category: string;
  hasSmallParts: boolean;
  purchaseDate: string;
  storageBox: string;
  photo: string;
  status: ToyStatus;
  isMissingParts: boolean;
  tags: ToyTag[];
  createdAt: string;
}

export interface RotationRecord {
  id: string;
  toyId: string;
  action: RotationAction;
  timestamp: string;
  note?: string;
}

export const TOY_CATEGORIES = [
  '积木拼装',
  '益智玩具',
  '毛绒玩具',
  '汽车模型',
  '娃娃人偶',
  '绘画手工',
  '户外运动',
  '音乐玩具',
  '绘本卡片',
  '其他',
];

export const AGE_RANGES = [
  '0-1岁',
  '1-2岁',
  '2-3岁',
  '3-4岁',
  '4-5岁',
  '5-6岁',
  '6-8岁',
  '8岁以上',
];

export const STATUS_LABELS: Record<ToyStatus, string> = {
  playing: '正在玩',
  stored: '收纳中',
  cleaning: '该清洗',
  giving: '准备送人',
  away: '已送出',
};

export const STATUS_COLORS: Record<ToyStatus, string> = {
  playing: 'bg-mint-100 text-mint-700',
  stored: 'bg-sky-100 text-sky-700',
  cleaning: 'bg-yellow-100 text-yellow-700',
  giving: 'bg-pink-100 text-pink-700',
  away: 'bg-gray-100 text-gray-500',
};

export const TAG_LABELS: Record<ToyTag, string> = {
  rainy: '雨天玩',
  'parent-child': '亲子互动',
  quiet: '安静游戏',
};

export const TAG_COLORS: Record<ToyTag, string> = {
  rainy: 'bg-blue-100 text-blue-700',
  'parent-child': 'bg-pink-100 text-pink-600',
  quiet: 'bg-purple-100 text-purple-700',
};
