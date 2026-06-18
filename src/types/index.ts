export interface CoffeeFlavor {
  id: string;
  name: string;
  brand: string;
  intensity: number;
  roastLevel: 'light' | 'medium' | 'dark';
  compatibleMachines: string[];
  unitPrice: number;
  boxPhoto: string;
  safetyStock: number;
  createdAt: string;
}

export interface InventoryBatch {
  id: string;
  flavorId: string;
  quantity: number;
  expiryDate: string;
  status: 'normal' | 'expired' | 'damp';
  createdAt: string;
}

export interface ConsumptionLog {
  id: string;
  flavorId: string;
  quantity: number;
  department: string;
  consumedAt: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'cleaning' | 'descaler' | 'cups' | 'other';
  quantity: number;
  unitPrice: number;
  safetyStock: number;
  expiryDate?: string;
  createdAt: string;
}

export interface SupplyLog {
  id: string;
  supplyId: string;
  quantity: number;
  type: 'consume' | 'restock';
  department?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export type PurchaseStatus = 'pending' | 'ordered' | 'received' | 'cancelled';
export type PurchaseType = 'coffee' | 'supply';

export interface PurchaseItem {
  id: string;
  itemType: PurchaseType;
  itemId: string;
  itemName: string;
  suggestedQuantity: number;
  actualQuantity: number;
  quantity: number;
  unitPrice: number;
  type: PurchaseType;
  status: PurchaseStatus;
  supplier?: string;
  remark?: string;
  createdAt: string;
  purchasedAt?: string;
  receivedAt?: string;
}

export interface StatisticsData {
  popularFlavors: { flavorId: string; name: string; total: number }[];
  departmentConsumption: { department: string; total: number; cost: number }[];
  weeklyCost: { week: string; cost: number }[];
  expiringItems: { id: string; name: string; daysLeft: number; quantity: number; itemType: 'coffee' | 'supply' }[];
  purchaseSuggestions: { id: string; name: string; currentStock: number; avgWeeklyConsumption: number; suggestedOrder: number; itemType: 'coffee' | 'supply' }[];
  totalConsumption: number;
  totalCost: number;
  activeFlavorCount: number;
  activeDepartmentCount: number;
}

export type FlavorWithStock = CoffeeFlavor & {
  totalStock: number;
  stockStatus: 'normal' | 'low' | 'expired' | 'damp' | 'out_of_stock';
  nearestExpiry?: string;
};

export type SupplyItemWithStatus = SupplyItem & {
  stockStatus: 'normal' | 'low' | 'expired' | 'out_of_stock';
};
