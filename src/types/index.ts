export interface Material {
  id: string;
  name: string;
  brand: string;
  specification: string;
  orderQuantity: number;
  unit: string;
  supplier: string;
  expectedDate: string;
  photo: string;
  room: string;
  category: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  materialId: string;
  deliveryDate: string;
  receivedQuantity: number;
  damagedQuantity: number;
  storageRoom: string;
  receiver: string;
  photo: string;
  remark: string;
  createdAt: string;
}

export type AfterSaleType = 'missing' | 'wrong' | 'damaged';
export type AfterSaleSeverity = 'low' | 'medium' | 'high';
export type AfterSaleStatus = 'pending' | 'processing' | 'resolved';

export interface AfterSale {
  id: string;
  materialId: string;
  type: AfterSaleType;
  severity: AfterSaleSeverity;
  status: AfterSaleStatus;
  description: string;
  solution: string;
  createdAt: string;
  resolvedAt: string | null;
  handler: string;
}

export type MaterialStatus = 'pending' | 'partial' | 'complete' | 'delayed';

export interface RoomStats {
  name: string;
  totalMaterials: number;
  completeMaterials: number;
  progress: number;
  materials: Material[];
}

export interface SupplierStats {
  name: string;
  totalMaterials: number;
  delayedCount: number;
  avgDelayDays: number;
  damagedRate: number;
}

export interface AfterSaleStats {
  total: number;
  pending: number;
  processing: number;
  resolved: number;
}
