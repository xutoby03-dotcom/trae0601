export interface Item {
  id: string;
  name: string;
  specification: string;
  currentStock: number;
  minStock: number;
  location: string;
  supplier: string;
  unitPrice: number;
  photoUrl: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface ReplenishRequest {
  id: string;
  itemId: string;
  currentRemaining: number;
  urgency: UrgencyLevel;
  remark: string;
  status: RequestStatus;
  applicantName: string;
  createdAt: string;
}

export type PurchaseStatus = 'ordered' | 'arrived' | 'cancelled';

export interface Purchase {
  id: string;
  requestId: string | null;
  itemId: string;
  quantity: number;
  expectedArrivalDate: string;
  actualAmount: number;
  receiptPhotoUrl: string;
  status: PurchaseStatus;
  createdAt: string;
  confirmedAt: string | null;
}

export type StockLogType = 'purchase' | 'consume' | 'adjust';

export interface StockLog {
  id: string;
  itemId: string;
  type: StockLogType;
  changeAmount: number;
  balanceAfter: number;
  remark: string;
  createdAt: string;
}

export interface AppState {
  items: Item[];
  requests: ReplenishRequest[];
  purchases: Purchase[];
  stockLogs: StockLog[];
}
