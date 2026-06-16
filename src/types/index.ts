export type ID = string;

export interface FishSpecies {
  id: ID;
  species_name: string;
  count: number;
  daily_grams_per_fish: number;
  notes?: string;
}

export interface Aquarium {
  id: ID;
  name: string;
  size_liters: number;
  water_temp: number;
  filter_type: string;
  photo_url?: string;
  food_type: string;
  morning_ratio: number;
  evening_ratio: number;
  fish_species: FishSpecies[];
  created_at: string;
  updated_at: string;
}

export type FeedingPeriod = "morning" | "evening";

export type LeftoverLevel = "none" | "little" | "medium" | "lots";
export type FishStatus = "normal" | "active" | "sluggish" | "sick";

export interface FeedingPlan {
  id: ID;
  aquarium_id: ID;
  date: string;
  morning_grams: number;
  evening_grams: number;
  morning_done: boolean;
  evening_done: boolean;
}

export interface FeedingRecord {
  id: ID;
  aquarium_id: ID;
  datetime: string;
  period: FeedingPeriod;
  feeder: string;
  actual_grams: number;
  leftover_level: LeftoverLevel;
  fish_status: FishStatus;
  notes?: string;
}

export interface WaterChange {
  id: ID;
  aquarium_id: ID;
  date: string;
  changed_liters: number;
  changed_percent?: number;
  notes?: string;
}

export interface WaterTest {
  id: ID;
  aquarium_id: ID;
  date: string;
  ph: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  notes?: string;
}

export interface FoodStock {
  id: ID;
  food_name: string;
  food_type: string;
  current_grams: number;
  last_purchase_date?: string;
  notes?: string;
}

export type AlertType =
  | "duplicate_feeding"
  | "missed_feeding"
  | "continuous_leftover"
  | "low_stock"
  | "no_aquarium";

export interface Alert {
  id: ID;
  type: AlertType;
  title: string;
  message: string;
  level: "info" | "warning" | "danger";
  aquarium_id?: ID;
  created_at: string;
}
