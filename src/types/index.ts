export type StorageZone = 'fridge' | 'freezer' | 'door';

export type DiscardReason = 'spoiled' | 'bought_too_much' | 'forgot' | 'bad_taste';

export type FoodStatus = 'fresh' | 'warning' | 'danger' | 'expired';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  zone: StorageZone;
  quantity: number;
  unit: string;
  remaining: number;
  purchaseDate: string;
  expiryDate: string;
  openedAt: string | null;
  shelfLifeDays: number;
  openedShelfLifeDays: number;
  price: number;
  notes: string;
  createdAt: string;
}

export interface DiscardRecord {
  id: string;
  foodId: string;
  foodName: string;
  wastedAmount: number;
  wastedQuantity: number;
  reason: DiscardReason;
  discardedAt: string;
}

export interface FoodFormData {
  name: string;
  emoji: string;
  category: string;
  zone: StorageZone;
  quantity: number;
  unit: string;
  purchaseDate: string;
  shelfLifeDays: number;
  openedShelfLifeDays: number;
  isOpened: boolean;
  openedAt?: string;
  price: number;
  notes: string;
}
