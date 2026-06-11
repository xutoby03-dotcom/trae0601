export enum SeatStatus {
  EMPTY = 'empty',
  IN_USE = 'in_use',
  TEMP_LEAVE = 'temp_leave',
  SUSPECTED = 'suspected',
}

export interface Seat {
  id: string;
  building: string;
  room: string;
  seatNumber: string;
  status: SeatStatus;
  registeredBy?: string;
  contact?: string;
  expectedLeaveAt?: number;
  tempLeaveUntil?: number;
  registeredAt?: number;
  statusUpdatedAt: number;
}

export interface Dispute {
  id: string;
  seatId: string;
  reporterName: string;
  photoUrl?: string;
  remark?: string;
  createdAt: number;
  status: 'pending' | 'resolved' | 'rejected';
  resolvedAt?: number;
  resolverNote?: string;
}

export interface StatsData {
  totalSeats: number;
  seatsByBuilding: Record<string, { total: number; inUse: number; suspected: number }>;
  suspectedByHour: number[];
  recoveredByDay: { date: string; count: number }[];
  totalRecovered: number;
}

export interface SeatRegistrationForm {
  building: string;
  room: string;
  seatNumber: string;
  registeredBy: string;
  contact: string;
  expectedLeaveAt: number;
  tempLeave?: boolean;
  tempLeaveMinutes?: number;
}

export interface DisputeForm {
  seatId: string;
  reporterName: string;
  photoUrl?: string;
  remark?: string;
}

export const BUILDINGS = ['一教', '二教', '三教', '图书馆', '信息楼', '综合楼'];

export const SEAT_STATUS_LABELS: Record<SeatStatus, string> = {
  [SeatStatus.EMPTY]: '空座',
  [SeatStatus.IN_USE]: '使用中',
  [SeatStatus.TEMP_LEAVE]: '短暂离开',
  [SeatStatus.SUSPECTED]: '疑似占座',
};

export const SEAT_STATUS_COLORS: Record<SeatStatus, { bg: string; text: string; border: string; dot: string }> = {
  [SeatStatus.EMPTY]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [SeatStatus.IN_USE]: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  [SeatStatus.TEMP_LEAVE]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  [SeatStatus.SUSPECTED]: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};
