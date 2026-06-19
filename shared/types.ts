export interface Member {
  id: string;
  name: string;
  phone: string;
  allergies: string[];
  religiousDiet: string;
  drinksAlcohol: boolean;
  notes: string;
  confirmed: boolean;
  createdAt: string;
}

export interface Dish {
  id: string;
  name: string;
  spiciness: 'none' | 'mild' | 'medium' | 'hot';
  hasSeafood: boolean;
  hasNuts: boolean;
  isVegetarian: boolean;
  price: number;
  notes: string;
}

export interface Plan {
  id: string;
  name: string;
  restaurant: string;
  date: string;
  totalTables: number;
  seatsPerTable: number;
  dishes: Dish[];
  drinks: {
    alcoholic: string[];
    nonAlcoholic: string[];
  };
  budget: number;
  createdAt: string;
}

export interface Table {
  id: number;
  name: string;
  memberIds: string[];
}

export interface Seating {
  planId: string;
  tables: Table[];
}

export interface Conflict {
  type: 'allergy' | 'vegetarian' | 'religious' | 'seating' | 'spiciness' | 'alcohol';
  severity: 'high' | 'medium' | 'low';
  message: string;
  tableId?: number;
  memberIds?: string[];
  dishId?: string;
  suggestion: string;
}

export interface DashboardStats {
  totalMembers: number;
  unconfirmedMembers: number;
  highRiskDishes: number;
  budgetDiff: number;
  dishesToReplace: number;
  pendingConflicts: Conflict[];
}

export const ALLERGY_OPTIONS = [
  { value: 'seafood', label: '海鲜', icon: 'Fish' },
  { value: 'nuts', label: '坚果', icon: 'TreePine' },
  { value: 'spicy', label: '辣', icon: 'Flame' },
  { value: 'dairy', label: '乳制品', icon: 'Milk' },
  { value: 'gluten', label: '麸质', icon: 'Wheat' },
  { value: 'soy', label: '大豆', icon: 'Leaf' },
  { value: 'eggs', label: '鸡蛋', icon: 'Egg' },
] as const;

export const RELIGIOUS_DIET_OPTIONS = [
  { value: '', label: '无特殊要求' },
  { value: 'halal', label: '清真' },
  { value: 'vegetarian', label: '素食' },
  { value: 'vegan', label: '纯素' },
  { value: 'hindu', label: '印度教（不食牛肉）' },
  { value: 'jewish', label: '犹太洁食' },
] as const;

export const SPICINESS_OPTIONS = [
  { value: 'none', label: '不辣', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'mild', label: '微辣', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'medium', label: '中辣', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'hot', label: '特辣', color: 'bg-red-100 text-red-700 border-red-200' },
] as const;

export type SpicinessLevel = typeof SPICINESS_OPTIONS[number]['value'];
