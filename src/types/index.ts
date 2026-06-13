export type BagStatus = 'available' | 'borrowed' | 'damaged' | 'lost';

export type BorrowStatus = 'active' | 'returned' | 'overdue' | 'lost';

export type InsulationStatus = 'excellent' | 'good' | 'fair' | 'poor';

export type Platform = 'meituan' | 'eleme' | 'douyin' | 'other';

export interface Bag {
  id: string;
  code: string;
  capacity: number;
  color: string;
  insulationStatus: InsulationStatus;
  deposit: number;
  photo: string;
  status: BagStatus;
  turnoverCount: number;
  damageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  bagId: string;
  riderName: string;
  platform: Platform;
  phone: string;
  orderNo: string;
  borrowTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  status: BorrowStatus;
  hasStain?: boolean;
  hasDamage?: boolean;
  zipperOk?: boolean;
  hasPad?: boolean;
  damageNote?: string;
  depositRefunded?: boolean;
  createdAt: string;
}

export interface BagFormData {
  code: string;
  capacity: number;
  color: string;
  insulationStatus: InsulationStatus;
  deposit: number;
  photo: string;
}

export interface BorrowFormData {
  bagId: string;
  riderName: string;
  platform: Platform;
  phone: string;
  orderNo: string;
  expectedReturnTime: string;
}

export interface ReturnFormData {
  hasStain: boolean;
  hasDamage: boolean;
  zipperOk: boolean;
  hasPad: boolean;
  damageNote: string;
  depositRefunded: boolean;
}
