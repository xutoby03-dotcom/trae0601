export type PaymentStatus = 'unpaid' | 'paid' | 'waived';

export interface ParkingZone {
  id: string;
  name: string;
  capacity: number;
  feeRule: string;
  feePerHour: number;
  freeMinutes: number;
  maxDailyFee: number;
  visitorAvailable: boolean;
  entrancePhoto?: string;
}

export interface VisitorRecord {
  id: string;
  plateNumber: string;
  building: string;
  contactPerson: string;
  phone: string;
  estimatedLeaveTime: string;
  carPhoto?: string;
  zoneId: string;
  entryTime: string;
  exitTime?: string;
  actualDuration?: number;
  fee?: number;
  paymentStatus: PaymentStatus;
  isOverdue: boolean;
}
