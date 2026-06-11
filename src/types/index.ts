export enum LadderStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  BORROWED = 'borrowed',
  OVERDUE = 'overdue',
}

export enum ReservationStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  BORROWED = 'borrowed',
  COMPLETED = 'completed',
}

export enum DamageLevel {
  NONE = 'none',
  MINOR = 'minor',
  SEVERE = 'severe',
}

export const PURPOSES = [
  '换灯泡',
  '挂窗帘',
  '打扫高处',
  '取放高处物品',
  '房屋维修',
  '粉刷墙面',
  '安装家电',
  '其他',
] as const;

export type Purpose = typeof PURPOSES[number];

export interface Ladder {
  id: string;
  name: string;
  type: string;
  status: LadderStatus;
  description?: string;
}

export interface Reservation {
  id: string;
  ladderId: string;
  borrowerName: string;
  building: string;
  startTime: string;
  expectedEndTime: string;
  purpose: Purpose;
  needHelp: boolean;
  phone: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  reservationId: string;
  borrowTime: string;
  operator: string;
}

export interface ReturnRecord {
  id: string;
  borrowRecordId: string;
  returnTime: string;
  damageLevel: DamageLevel;
  damageDescription: string;
  damagePhoto?: string;
}

export interface ReservationWithLadder extends Reservation {
  ladder: Ladder | undefined;
}

export interface BorrowRecordFull extends BorrowRecord {
  reservation: Reservation | undefined;
  ladder: Ladder | undefined;
  returnRecord: ReturnRecord | undefined;
}
