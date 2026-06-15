export type FoodStatus = 'frozen' | 'thawing' | 'cooked' | 'returned';
export type ThawMethod = 'fridge' | 'cold_water';
export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface FoodItem {
  id: string;
  name: string;
  weight: number;
  drawer: string;
  category: string;
  frozenDate: string;
  shelfLifeDays: number;
  suitableDishes: string[];
  photo?: string;
  status: FoodStatus;
  thawCount: number;
  thawStartTime?: string;
  thawMethod?: ThawMethod;
  createdAt: string;
  updatedAt: string;
}

export interface ThawHistory {
  id: string;
  foodItemId: string;
  action: 'start_thaw' | 'return_freeze' | 'cook' | 'discard';
  method?: ThawMethod;
  timestamp: string;
  note?: string;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  requiredWeight: number;
  suitableMeats: string[];
  emoji: string;
  description: string;
}

export interface Drawer {
  id: string;
  name: string;
  icon: string;
}

export interface ThawPlan {
  foodItem: FoodItem;
  method: ThawMethod;
  thawDurationHours: number;
  takeOutTime: string;
  readyTime: string;
  canMakeIt: boolean;
}

export interface RiskAssessment {
  level: RiskLevel;
  reasons: string[];
  suggestion: string;
}
