export interface Product {
  id: string;
  name: string;
  flavor: string;
  shelfLifeDays: number;
  openDurationHours: number;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  stock: number;
  initialStock: number;
  createdAt: string;
}

export type TastingStatus = 'active' | 'completed' | 'expired';

export interface TastingRecord {
  id: string;
  batchId: string;
  operatorName: string;
  stationLocation: string;
  portion: number;
  startTime: string;
  expectedEndTime: string;
  actualEndTime?: string;
  status: TastingStatus;
  remainingPortion: number;
  convertedOrders: number;
  note?: string;
}

export interface Order {
  id: string;
  tastingId?: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  createdAt: string;
}

export interface ProductWithBatches extends Product {
  batches: ProductBatch[];
}

export interface TastingWithDetails extends TastingRecord {
  product: Product;
  batch: ProductBatch;
}

export type BatchUrgency = 'normal' | 'near' | 'urgent' | 'expired';
