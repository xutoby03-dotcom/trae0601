import type { StorageZone, DiscardReason } from '@/types';

export const STORAGE_ZONE_LABEL: Record<StorageZone, string> = {
  fridge: '冷藏层',
  freezer: '冷冻抽屉',
  door: '门架',
};

export const STORAGE_ZONE_EMOJI: Record<StorageZone, string> = {
  fridge: '❄️',
  freezer: '🧊',
  door: '🚪',
};

export const DISCARD_REASON_LABEL: Record<DiscardReason, string> = {
  spoiled: '变质了',
  bought_too_much: '买多了',
  forgot: '忘记吃',
  bad_taste: '口味不合',
};

export const DISCARD_REASON_EMOJI: Record<DiscardReason, string> = {
  spoiled: '🦠',
  bought_too_much: '📦',
  forgot: '🗓️',
  bad_taste: '🤢',
};

export const DISCARD_REASON_COLOR: Record<DiscardReason, string> = {
  spoiled: 'bg-red-100 text-red-700 border-red-200',
  bought_too_much: 'bg-amber-100 text-amber-700 border-amber-200',
  forgot: 'bg-sky-100 text-sky-700 border-sky-200',
  bad_taste: 'bg-violet-100 text-violet-700 border-violet-200',
};

export interface OpenedShelfLifeRule {
  keywords?: string[];
  categories?: string[];
  days: number;
  label: string;
}

export const OPENED_SHELF_LIFE_RULES: OpenedShelfLifeRule[] = [
  {
    keywords: ['酸奶'],
    categories: [],
    days: 3,
    label: '乳制品(酸奶)',
  },
  {
    keywords: ['牛奶'],
    categories: [],
    days: 3,
    label: '鲜牛奶',
  },
  {
    keywords: ['豆腐'],
    categories: ['豆制品'],
    days: 2,
    label: '豆腐/豆制品',
  },
  {
    keywords: ['熟食', '卤味', '酱肉', '烧鸡', '烤鸭'],
    categories: ['熟食'],
    days: 2,
    label: '熟食/卤味',
  },
  {
    keywords: ['沙拉酱', '千岛酱', '蛋黄酱', '芥末酱'],
    categories: ['酱料'],
    days: 7,
    label: '沙拉/调味酱',
  },
  {
    keywords: ['果酱', '蜂蜜'],
    categories: [],
    days: 14,
    label: '果酱类',
  },
  {
    keywords: ['果汁', '鲜榨'],
    categories: [],
    days: 3,
    label: '鲜榨果汁',
  },
  {
    keywords: ['豆浆', '豆奶'],
    categories: [],
    days: 2,
    label: '豆浆/豆奶',
  },
  {
    keywords: ['奶油', '芝士', '奶酪'],
    categories: ['乳制品'],
    days: 5,
    label: '奶油/芝士',
  },
  {
    keywords: ['便当', '盒饭', '剩菜', '剩米饭'],
    categories: ['熟食'],
    days: 1,
    label: '剩菜/便当',
  },
];

export const COMMON_UNITS = ['个', '盒', '袋', '瓶', '包', '克', '千克', 'ml', 'L', '块', '根', '颗', '把'];

export const FOOD_CATEGORIES = [
  '蔬菜', '水果', '肉类', '海鲜', '乳制品', '豆制品',
  '熟食', '酱料', '饮料', '主食', '零食', '蛋类',
];

export const FOOD_EMOJI_OPTIONS = [
  '🥬', '🥦', '🥕', '🌽', '🥔', '🍅', '🍆', '🥒', '🌶️', '🧄',
  '🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥭', '🍌', '🍉',
  '🥩', '🍗', '🥓', '🍖', '🦐', '🐟', '🦀', '🥚',
  '🥛', '🧀', '🍦', '🧈', '🥚', '🍳',
  '🍞', '🥐', '🥖', '🍜', '🍝', '🍚', '🍙',
  '🥫', '🫙', '🍶', '🧃', '🧊', '🍱',
];
