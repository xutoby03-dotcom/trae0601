export interface Product {
  id: string;
  brand: string;
  flavor: string;
  specification: string;
  costPrice: number;
  salePrice: number;
  shelfLifeDays: number;
  fridgeLocation: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = 'normal' | 'near_expiry' | 'clearance' | 'expired' | 'sold_out';

export interface Batch {
  id: string;
  productId: string;
  quantity: number;
  remainingQuantity: number;
  productionDate: string;
  expiryDate: string;
  supplier: string;
  status: BatchStatus;
  createdAt: string;
}

export type PriceType = 'normal' | 'discount' | 'clearance';

export interface SaleItem {
  id: string;
  saleId: string;
  batchId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  priceType: PriceType;
}

export interface Sale {
  id: string;
  totalAmount: number;
  discountAmount: number;
  actualAmount: number;
  saleTime: string;
  paymentMethod: string;
  items: SaleItem[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface BatchPriceInfo {
  batchId: string;
  price: number;
  priceType: PriceType;
  availableQuantity: number;
}
