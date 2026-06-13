export type BunkType = 'upper' | 'lower';
export type DisinfectionStatus = 'completed' | 'pending' | 'expired';
export type TimeSlot = 'morning' | 'afternoon' | 'full';
export type ReservationStatus = 'pending' | 'checked_in' | 'absent' | 'swapped';
export type CheckInStatus = 'pending' | 'checked_in' | 'absent';

export interface Bed {
  id: number;
  room: string;
  bedNumber: string;
  bunkType: BunkType;
  isWindowSide: boolean;
  disinfectionStatus: DisinfectionStatus;
  disinfectionDate: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface Reservation {
  id: number;
  bedId: number;
  className: string;
  studentName: string;
  date: string;
  timeSlot: TimeSlot;
  allergyNote: string;
  parentConfirmed: boolean;
  status: ReservationStatus;
  createdAt: string;
  bed?: Bed;
}

export interface CheckInRecord {
  id: number;
  reservationId: number;
  checkInTime: string | null;
  status: CheckInStatus;
}

export interface BedSwap {
  id: number;
  reservationId: number;
  fromBedId: number;
  toBedId: number;
  reason: string | null;
  createdAt: string;
}

export interface OverviewStats {
  todayReservations: number;
  todayCheckedIn: number;
  todayVacant: number;
  pendingDisinfection: number;
}

export interface ClassUsage {
  className: string;
  count: number;
}

export interface VacancyRate {
  total: number;
  occupied: number;
  vacant: number;
  rate: number;
}

export interface ConflictCheckResult {
  available: boolean;
  reason?: string;
}
