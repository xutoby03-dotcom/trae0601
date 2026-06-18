export interface Guest {
  id: string;
  name: string;
  relation: string;
  group: 'bride' | 'groom' | 'friend' | 'colleague' | 'other';
  headCount: number;
  contact: string;
  dietaryRestrictions: string[];
  allergens: string[];
  isChild: boolean;
  isElderly: boolean;
  needsSpecialMeal: boolean;
  notes: string;
  confirmed: boolean;
  tableId?: string | null;
}

export interface Table {
  id: string;
  tableNumber: number;
  tableName?: string;
  capacity: number;
  guestIds: string[];
  printed: boolean;
}

export interface ConflictAlert {
  type: 'allergen' | 'relation' | 'custom';
  severity: 'high' | 'medium' | 'low';
  message: string;
  guestIds: string[];
}

export interface SpecialMealSummary {
  vegetarian: number;
  vegan: number;
  glutenFree: number;
  noSeafood: number;
  noPork: number;
  noBeef: number;
  childMeal: number;
  softFood: number;
  other: number;
}

export interface KitchenOrder {
  tableId: string;
  tableNumber: number;
  totalGuests: number;
  specialMeals: {
    type: string;
    count: number;
    guestNames: string[];
  }[];
  allergens: {
    allergen: string;
    count: number;
    guestNames: string[];
  }[];
}

export interface WaiterNote {
  tableId: string;
  tableNumber: number;
  elderlyCount: number;
  childCount: number;
  specialAssistance: string[];
}

export type TabKey = 'dashboard' | 'guests' | 'seating' | 'tableCards' | 'kitchen';
