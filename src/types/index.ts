export interface Bouquet {
  id: string;
  name: string;
  materials: string;
  color: string;
  price: number;
  stock: number;
  reservedCount: number;
  freshLocation: string;
  photo: string;
  freshUntil: string;
  category: string;
  description: string;
  createdAt: string;
}

export type ReservationStatus = 'pending' | 'to_confirm' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  bouquetId: string;
  bouquetName: string;
  bouquetPhoto: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  deposit: number;
  cardMessage: string;
  specialPackaging: string;
  status: ReservationStatus;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export type OperationType = 'create' | 'complete' | 'cancel' | 'reschedule' | 'timeout';

export interface OperationRecord {
  id: string;
  reservationId: string;
  customerName: string;
  bouquetName: string;
  type: OperationType;
  operator: string;
  note: string;
  createdAt: string;
}

export interface DashboardStats {
  todayPickups: number;
  freshWarningCount: number;
  conversionRate: number;
  totalReservations: number;
  completedCount: number;
  cancelledCount: number;
  mostCancelledBouquets: { name: string; count: number }[];
}
