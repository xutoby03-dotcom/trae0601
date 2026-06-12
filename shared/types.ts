export interface Room {
  id: number;
  name: string;
  keyNumber: string;
  availableTime: string;
  deposit: number;
  manager: string;
  doorPhoto: string;
  createdAt: string;
}

export interface RoomForm {
  name: string;
  keyNumber: string;
  availableTime: string;
  deposit: number;
  manager: string;
  doorPhoto?: string;
}

export type DepositStatus = 'paid' | 'unpaid' | 'refunded';
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue';

export interface Borrow {
  id: number;
  roomId: number;
  roomName: string;
  activityName: string;
  borrowerName: string;
  phone: string;
  startTime: string;
  endTime: string;
  depositStatus: DepositStatus;
  status: BorrowStatus;
  returnChecklist?: {
    door: boolean;
    window: boolean;
    light: boolean;
    aircon: boolean;
  };
  returnedAt?: string;
  createdAt: string;
}

export interface BorrowForm {
  roomId: number;
  activityName: string;
  borrowerName: string;
  phone: string;
  startTime: string;
  endTime: string;
  depositStatus: 'paid' | 'unpaid';
}

export interface ReturnForm {
  doorChecked: boolean;
  windowChecked: boolean;
  lightChecked: boolean;
  airconChecked: boolean;
  depositRefunded?: boolean;
}

export type ExceptionType = 'key_lost' | 'room_damage' | 'other';
export type ExceptionStatus = 'pending' | 'processing' | 'resolved';

export interface ExceptionRecord {
  id: number;
  borrowId?: number;
  roomId: number;
  roomName: string;
  type: ExceptionType;
  description: string;
  measure: string;
  compensation: number;
  status: ExceptionStatus;
  createdAt: string;
}

export interface ExceptionForm {
  borrowId?: number;
  roomId: number;
  type: ExceptionType;
  description: string;
  measure: string;
  compensation: number;
  status: ExceptionStatus;
}

export interface RoomStat {
  roomId: number;
  roomName: string;
  keyNumber: string;
  borrowed: number;
  pendingReturn: number;
  overdue: number;
  weeklyUsage: number;
}

export interface DashboardStats {
  totalRooms: number;
  totalBorrowed: number;
  totalOverdue: number;
  weeklyUsage: number;
  roomStats: RoomStat[];
  overdueRecords: Borrow[];
}
