export type ConnectorType = 'HDMI' | 'Type-C' | 'Mac' | 'VGA' | 'DP';

export type DeviceStatus = 'available' | 'borrowed' | 'faulty' | 'maintenance';

export type BorrowStatus = 'pending' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';

export type AppearanceCheck = 'good' | 'minor-damage' | 'damaged';

export interface Room {
  id: string;
  name: string;
  floor: string;
  capacity: number;
}

export interface Device {
  id: string;
  name: string;
  type: ConnectorType;
  serialNumber: string;
  compatibleDevices: string[];
  roomId: string;
  status: DeviceStatus;
  photo: string;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  deviceId: string;
  borrowerName: string;
  borrowerDept: string;
  startTime: string;
  endTime: string;
  actualReturnTime?: string;
  purpose: string;
  status: BorrowStatus;
  appearanceCheck?: AppearanceCheck;
  projectionOK?: boolean;
  pouchPresent?: boolean;
  returnNotes?: string;
}

export interface DashboardStats {
  totalBorrowed: number;
  overdueCount: number;
  faultyCount: number;
  highDemandTypes: {
    type: ConnectorType;
    count: number;
    deficit: number;
    available: number;
    borrowed: number;
    faulty: number;
    total: number;
  }[];
}

export interface ConflictAlternative {
  type: 'room' | 'device' | 'time';
  title: string;
  description: string;
  deviceId?: string;
  roomId?: string;
  suggestedTime?: string;
}

export interface BorrowFormData {
  roomId: string;
  deviceType: ConnectorType;
  startTime: string;
  endTime: string;
  borrowerName: string;
  borrowerDept: string;
  purpose: string;
}

export interface ReturnFormData {
  appearanceCheck: AppearanceCheck;
  projectionOK: boolean;
  pouchPresent: boolean;
  returnNotes: string;
}
