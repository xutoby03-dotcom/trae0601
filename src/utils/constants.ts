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

export const OPENED_SHELF_LIFE_OVERRIDE: Record<string, number> = {
  '酸奶': 3,
  '牛奶': 3,
  '豆腐': 2,
  '熟食': 2,
  '肉类熟食': 2,
  '沙拉酱': 7,
  '果酱': 14,
  '开封即用': 1,
  '果汁': 3,
  '豆浆': 2,
};

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
