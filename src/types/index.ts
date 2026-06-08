export type FoodCategory = "vegetable" | "fruit" | "meat" | "dairy" | "condiment" | "drink" | "grain" | "other";
export type FoodUnit = "个" | "斤" | "袋" | "瓶" | "盒" | "包" | "根" | "块";
export type StorageLocation = "fridge" | "freezer" | "door" | "drawer";

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  purchaseDate: string;
  shelfLifeDays: number;
  storageLocation: StorageLocation;
  icon: string;
  photo?: string;
  lowThreshold: number;
  consumed: boolean;
  consumedDate?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: FoodCategory;
  targetQuantity: number;
  unit: string;
  purchased: boolean;
  addedDate: string;
}

export interface RecipeIngredient {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  difficulty: "easy" | "medium" | "hard";
  icon: string;
}

export interface WasteRecord {
  id: string;
  foodItemId: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  wasteDate: string;
  reason: "expired" | "spoiled" | "other";
}

export type ExpiryStatus = "expired" | "expiring" | "warning" | "fresh";

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  vegetable: "蔬菜",
  fruit: "水果",
  meat: "肉类",
  dairy: "乳制品",
  condiment: "调味品",
  drink: "饮品",
  grain: "主食",
  other: "其他",
};

export const LOCATION_LABELS: Record<StorageLocation, string> = {
  fridge: "冷藏区",
  freezer: "冷冻区",
  door: "门架",
  drawer: "抽屉",
};

export const UNIT_OPTIONS: FoodUnit[] = ["个", "斤", "袋", "瓶", "盒", "包", "根", "块"];
