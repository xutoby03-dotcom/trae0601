export type Category = 'meat' | 'staple' | 'vegetable' | 'seafood' | 'dessert' | 'other';

export interface FreezerPosition {
  drawer: number;
  cell: number;
}

export interface FreezerItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  position: FreezerPosition;
  isPackaged: boolean;
  isOpened: boolean;
  photo?: string;
  price?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumedRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  consumedAt: string;
  reason: 'used' | 'expired' | 'moved';
  note?: string;
}

export interface FreezerLayout {
  drawers: number;
  cellsPerDrawer: number;
  drawerNames: string[];
}

export interface Recipe {
  name: string;
  ingredients: { name: string; amount: number; unit: string }[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  meat: '肉类',
  staple: '主食',
  vegetable: '蔬菜',
  seafood: '海鲜',
  dessert: '甜品',
  other: '其他',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  meat: 'bg-category-meat',
  staple: 'bg-category-staple',
  vegetable: 'bg-category-vegetable',
  seafood: 'bg-category-seafood',
  dessert: 'bg-category-dessert',
  other: 'bg-category-other',
};

export const CATEGORY_TEXT_COLORS: Record<Category, string> = {
  meat: 'text-category-meat',
  staple: 'text-category-staple',
  vegetable: 'text-category-vegetable',
  seafood: 'text-category-seafood',
  dessert: 'text-category-dessert',
  other: 'text-category-other',
};

export const COMMON_UNITS = ['个', '包', '袋', '盒', '斤', '克', 'kg', '片', '块', '份'];

export const DEFAULT_LAYOUT: FreezerLayout = {
  drawers: 4,
  cellsPerDrawer: 6,
  drawerNames: ['第一层', '第二层', '第三层', '第四层'],
};

export const SAMPLE_RECIPES: Recipe[] = [
  {
    name: '可乐鸡翅',
    ingredients: [
      { name: '鸡翅', amount: 500, unit: '克' },
      { name: '可乐', amount: 1, unit: '罐' },
    ],
  },
  {
    name: '煎牛排',
    ingredients: [
      { name: '牛排', amount: 2, unit: '块' },
      { name: '黄油', amount: 20, unit: '克' },
    ],
  },
  {
    name: '煮饺子',
    ingredients: [
      { name: '饺子', amount: 30, unit: '个' },
    ],
  },
  {
    name: '宫保鸡丁',
    ingredients: [
      { name: '鸡胸肉', amount: 300, unit: '克' },
      { name: '花生', amount: 50, unit: '克' },
    ],
  },
  {
    name: '红烧肉',
    ingredients: [
      { name: '五花肉', amount: 500, unit: '克' },
    ],
  },
  {
    name: '清蒸虾',
    ingredients: [
      { name: '虾', amount: 300, unit: '克' },
    ],
  },
  {
    name: '酸菜鱼',
    ingredients: [
      { name: '鱼片', amount: 400, unit: '克' },
      { name: '酸菜', amount: 200, unit: '克' },
    ],
  },
  {
    name: '烤蛋挞',
    ingredients: [
      { name: '蛋挞皮', amount: 10, unit: '个' },
      { name: '蛋挞液', amount: 200, unit: 'ml' },
    ],
  },
];
