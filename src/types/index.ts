export type EquipmentCategory =
  | "tent"
  | "tarp"
  | "sleepingbag"
  | "stove"
  | "furniture"
  | "lighting";

export type EquipmentStatus =
  | "available"
  | "drying"
  | "repairing"
  | "missing"
  | "unavailable";

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  purchaseDate: string;
  storageBox: string;
  photo?: string;
  notes?: string;
  status: EquipmentStatus;
  batteryLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = "planning" | "ongoing" | "completed";

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: TripStatus;
  notes?: string;
  createdAt: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  equipmentId: string;
  packed: boolean;
  packedAt?: string;
}

export interface ReturnCheck {
  id: string;
  tripId: string;
  equipmentId: string;
  hasDirt: boolean;
  isWet: boolean;
  isMissingParts: boolean;
  isDamaged: boolean;
  batteryLevel?: number;
  notes?: string;
  checkedAt: string;
}

export type DryingStatus = "drying" | "completed";

export interface DryingRecord {
  id: string;
  equipmentId: string;
  tripId?: string;
  location: string;
  startTime: string;
  flipTime?: string;
  endTime?: string;
  status: DryingStatus;
  notes?: string;
}

export type MaintenanceType = "repair" | "purchase";
export type MaintenanceStatus = "pending" | "in_progress" | "completed";

export interface MaintenanceRecord {
  id: string;
  equipmentId?: string;
  type: MaintenanceType;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  status: MaintenanceStatus;
  createdAt: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface CategoryMeta {
  id: EquipmentCategory;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface StatusMeta {
  id: EquipmentStatus;
  name: string;
  color: string;
  bgColor: string;
}
