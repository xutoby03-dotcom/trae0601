export type BatchStatus =
  | 'unopened'
  | 'resting'
  | 'optimal'
  | 'declining'
  | 'expired'
  | 'low_stock';

export type BrewingMethod = 'pour_over' | 'espresso' | 'cold_brew';

export interface CoffeeBatch {
  id: string;
  origin: string;
  processMethod: string;
  roastDate: string;
  openDate: string | null;
  suggestedDays: number;
  initialWeight: number;
  currentWeight: number;
  lowThreshold: number;
  photo: string | null;
  flavorTags: string[];
  notes?: string;
  createdAt: string;
}

export interface BrewingRecord {
  id: string;
  batchId: string;
  date: string;
  grams: number;
  method: BrewingMethod;
  grindSize: number | null;
  waterTemp: number | null;
  ratio: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
}

export interface RestockItem {
  batchId: string;
  origin: string;
  currentWeight: number;
  dailyRate: number;
  estimatedEmptyDate: string;
  suggestedAmount: number;
}

export interface Statistics {
  totalBatches: number;
  restingCount: number;
  expiringSoon: number;
  totalConsumed: number;
  totalWasted: number;
  consumptionRates: { batchId: string; origin: string; rate: number }[];
  avgRatings: { batchId: string; origin: string; avgRating: number; count: number }[];
  restockSuggestions: RestockItem[];
}

export type StatusFilter = 'all' | BatchStatus;
