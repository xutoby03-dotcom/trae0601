export type BatchStatus = 'pending' | 'arrived' | 'completed';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type QueueStatus = 'not_queued' | 'waiting' | 'called' | 'picked' | 'timeout';

export interface GroupBatch {
  id: string;
  productName: string;
  arrivalTime: string;
  totalQuantity: number;
  needRefrigeration: boolean;
  productImage?: string;
  status: BatchStatus;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  batchId: string;
  customerName: string;
  phone: string;
  quantity: number;
  paymentStatus: PaymentStatus;
  pickupCode: string;
  notes?: string;
  queueNumber?: number;
  queueStatus: QueueStatus;
  queuedAt?: string;
  calledAt?: string;
  pickedAt?: string;
  callCount: number;
  isPriority: boolean;
}

export interface QueueState {
  currentNumber: number;
  waitingQueue: CustomerOrder[];
  calledOrder: CustomerOrder | null;
  lastCalledAt: string | null;
}

export interface HourlyPressure {
  hour: string;
  count: number;
}

export interface DashboardStats {
  currentCalled: number | null;
  waitingCount: number;
  pickedCount: number;
  notPickedCount: number;
  abnormalCount: number;
  hourlyPressure: HourlyPressure[];
}
