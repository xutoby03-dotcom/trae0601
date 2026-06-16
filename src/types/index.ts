export type FreezerStatus = 'normal' | 'warning' | 'abnormal';
export type DoorSealStatus = 'good' | 'normal' | 'poor';
export type FrostStatus = 'none' | 'light' | 'medium' | 'heavy';
export type SofteningLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type ShiftType = 'morning' | 'afternoon' | 'night';
export type LossReportType = 'loss' | 'isolate';
export type LossReportStatus = 'pending' | 'approved' | 'rejected';
export type ProductStatus = 'good' | 'partial' | 'bad';

export interface Product {
  id: string;
  brand: string;
  flavor: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  stock: number;
}

export interface Zone {
  id: string;
  name: string;
  products: Product[];
}

export interface Freezer {
  id: string;
  name: string;
  location: string;
  minTemp: number;
  maxTemp: number;
  manager: string;
  managerPhone: string;
  thermometerPhoto?: string;
  status: FreezerStatus;
  zones: Zone[];
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  freezerId: string;
  temperature: number;
  doorSealStatus: DoorSealStatus;
  frostStatus: FrostStatus;
  softeningLevel: SofteningLevel;
  photos: string[];
  inspector: string;
  shift: ShiftType;
  notes?: string;
  isAbnormal: boolean;
  createdAt: string;
}

export interface LossItem {
  id: string;
  productId?: string;
  brand: string;
  flavor: string;
  category: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface LossReport {
  id: string;
  freezerId: string;
  inspectionId?: string;
  type: LossReportType;
  status: LossReportStatus;
  totalAmount: number;
  items: LossItem[];
  submitter: string;
  reviewer?: string;
  reviewTime?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface Recheck {
  id: string;
  freezerId: string;
  inspectionId: string;
  recheckTime: string;
  rechecker: string;
  temperature: number;
  productStatus: ProductStatus;
  notes?: string;
  isResolved: boolean;
}
