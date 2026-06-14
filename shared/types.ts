export type ReservationStatus = 'pending' | 'checked_in' | 'no_show' | 'cancelled' | 'left_early';

export type ChangeType = 'leave' | 'seat_change' | 'early_leave';

export interface Classroom {
  id: string;
  building: string;
  roomNumber: string;
  seatCount: number;
  openTime: string;
  closeTime: string;
  teacherInCharge: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  classroomId: string;
  seatNumber: number;
  hasPowerOutlet: boolean;
  isActive: boolean;
}

export interface Student {
  id: string;
  className: string;
  name: string;
  noShowCount: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  classroomId: string;
  seatId: string;
  studentId: string;
  className: string;
  studentName: string;
  reservationDate: string;
  timeSlot: string;
  needsPowerOutlet: boolean;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
}

export interface CheckinRecord {
  id: string;
  reservationId: string;
  checkinTime: string;
  status: 'success' | 'late';
}

export interface ChangeRecord {
  id: string;
  reservationId: string;
  changeType: ChangeType;
  reason: string;
  fromSeatId?: string;
  toSeatId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSeats: number;
  availableSeats: number;
  checkedInCount: number;
  pendingCount: number;
  noShowCount: number;
  classUsage: { className: string; usageRate: number; total: number; used: number }[];
  frequentNoShows: { id: string; studentId: string; name: string; className: string; count: number }[];
}

export const CLASS_LIST = ['高一(1)班', '高一(2)班', '高一(3)班', '高二(1)班', '高二(2)班', '高三(1)班', '高三(2)班'];

export const TIME_SLOTS = ['18:00-19:30', '19:40-21:10', '21:20-22:30'];

export const AUTO_RELEASE_MINUTES = 15;
