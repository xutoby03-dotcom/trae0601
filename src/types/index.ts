export type BuildingType = 'sports' | 'lab' | 'dormitory';

export type MedicineStatus = 'sufficient' | 'low' | 'insufficient' | 'expired';

export interface Cabinet {
  id: string;
  name: string;
  location: string;
  building: BuildingType;
  photos: string[];
  createdAt: string;
}

export interface Medicine {
  id: string;
  cabinetId: string;
  name: string;
  specification: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  minimumQuantity: number;
  lastSupplier: string;
  isExpired: boolean;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  cabinetId: string;
  medicineId: string;
  purpose: string;
  studentName?: string;
  quantity: number;
  needParentFollowUp: boolean;
  operator: string;
  createdAt: string;
}

export interface SupplyRecord {
  id: string;
  cabinetId: string;
  medicineId: string;
  source: string;
  quantity: number;
  supplier: string;
  createdAt: string;
}

export interface BuildingStats {
  building: BuildingType;
  buildingName: string;
  lowStockCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  totalMedicines: number;
}

export interface LocationUsage {
  location: string;
  cabinetId: string;
  count: number;
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  cabinetId: string;
  cabinetName: string;
  building: BuildingType;
  currentQuantity: number;
  minimumQuantity: number;
  gap: number;
}

export const BUILDING_NAMES: Record<BuildingType, string> = {
  sports: '运动场',
  lab: '实验楼',
  dormitory: '宿舍楼',
};

export const STATUS_LABELS: Record<MedicineStatus, string> = {
  sufficient: '充足',
  low: '偏低',
  insufficient: '不足',
  expired: '过期',
};

export const STATUS_COLORS: Record<MedicineStatus, string> = {
  sufficient: 'bg-success-500',
  low: 'bg-warning-500',
  insufficient: 'bg-danger-500',
  expired: 'bg-danger-700',
};
