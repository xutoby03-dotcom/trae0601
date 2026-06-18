export type TableStatus = 'available' | 'in-use' | 'maintenance' | 'disabled';
export type NetStatus = 'good' | 'damaged' | 'missing';
export type BookingStatus = 'pending' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
export type DamageType = 'racket' | 'net' | 'table' | 'ball';
export type DamageStatus = 'pending' | 'resolved';

export interface Table {
  id: string;
  name: string;
  location: string;
  openTimeStart: string;
  openTimeEnd: string;
  netStatus: NetStatus;
  racketCount: number;
  status: TableStatus;
  photo: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  tableId: string;
  date: string;
  startTime: string;
  endTime: string;
  playerCount: number;
  racketBorrowed: number;
  phone: string;
  bookingCode: string;
  status: BookingStatus;
  checkedInAt?: string;
  createdAt: string;
}

export interface ReturnRecord {
  id: string;
  bookingId: string;
  racketReturned: number;
  hasDamage: boolean;
  damageDesc: string;
  ballMissing: boolean;
  note: string;
  createdAt: string;
}

export interface DamageRecord {
  id: string;
  tableId: string;
  type: DamageType;
  description: string;
  status: DamageStatus;
  reportedAt: string;
  resolvedAt?: string;
  bookingId?: string;
  bookingCode?: string;
  phone?: string;
  returnedAt?: string;
  note?: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  selected: boolean;
  bookingId?: string;
}

export interface HotSlotData {
  slot: string;
  count: number;
}

export interface NoShowRecord {
  phone: string;
  count: number;
  lastDate: string;
}
