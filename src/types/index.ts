export interface Device {
  id: string;
  brand: string;
  location: string;
  filterModel: string;
  suggestCycleDays: number;
  purchaseChannel: string;
  photoUrl: string;
  notes?: string;
  createdAt: string;
}

export interface ReplacementRecord {
  id: string;
  deviceId: string;
  batchNumber: string;
  installDate: string;
  expectedExpireDate: string;
  installer: string;
  cost: number;
  notes?: string;
  createdAt: string;
}

export interface Inventory {
  id: string;
  filterModel: string;
  quantity: number;
  unitPrice: number;
  lastUpdated: string;
}

export interface Reminder {
  deviceId: string;
  device: Device;
  filterModel: string;
  location: string;
  remainingDays: number;
  expectedExpireDate: string;
  urgency: 'normal' | 'warning' | 'urgent';
}

export type UrgencyLevel = 'normal' | 'warning' | 'urgent';

export interface MonthlyCost {
  month: string;
  cost: number;
}

export interface PurchaseSuggestion {
  filterModel: string;
  currentStock: number;
  estimatedDaysLeft: number;
  suggestedPurchaseDate: string;
  reason: string;
}
