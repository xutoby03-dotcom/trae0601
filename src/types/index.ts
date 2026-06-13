export type DeviceStatus = 'available' | 'lent' | 'maintenance' | 'low_battery';

export type LendingStatus = 'active' | 'returned' | 'overdue';

export type CompensationStatus = 'pending' | 'paid' | 'waived';

export interface Device {
  id: string;
  deviceNumber: string;
  capacity: number;
  interfaceType: string;
  currentBattery: number;
  accessories: string[];
  storageCabinet: string;
  photoUrl: string;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LendingRecord {
  id: string;
  deviceId: string;
  borrowerName: string;
  phone: string;
  deposit: number;
  expectedReturnDate: string;
  purpose: string;
  lendDate: string;
  returnDate?: string;
  status: LendingStatus;
  returnBattery?: number;
  cableOk?: boolean;
  shellOk?: boolean;
  missingAccessories?: string[];
}

export interface Compensation {
  id: string;
  lendingRecordId: string;
  amount: number;
  reason: string;
  status: CompensationStatus;
  createdAt: string;
}

export interface CompensationStandard {
  [key: string]: number;
}

export interface DailyStats {
  date: string;
  count: number;
}
