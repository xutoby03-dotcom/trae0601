export type PianoType = 'grand' | 'upright' | 'digital' | 'hybrid';

export type RoomStatus = 'available' | 'maintenance' | 'temporarily_closed';

export type BookingStatus = 'confirmed' | 'cancelled' | 'no_show' | 'waitlist' | 'completed';

export type SlotStatus = 'available' | 'booked' | 'waitlist_only' | 'blocked';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Room {
  id: string;
  roomNumber: string;
  pianoType: PianoType;
  floor: number;
  hasMusicStand: boolean;
  photoUrl: string;
  availableTimeSlots: string[];
  status: RoomStatus;
  maintenanceReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  studentName: string;
  major: string;
  phone: string;
  practicePurpose: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  isWaitlist: boolean;
  waitlistPosition?: number;
  createdAt: string;
  cancelledAt?: string;
  noShowRecorded?: boolean;
}

export interface TimeSlotAvailability {
  roomId: string;
  date: string;
  timeSlot: string;
  status: SlotStatus;
  currentBookings: number;
  maxCapacity: number;
  waitlistCount: number;
}

export interface Statistics {
  roomUtilization: {
    roomId: string;
    roomNumber: string;
    utilizationRate: number;
    weeklyData: number[];
  }[];
  noShowStudents: {
    studentName: string;
    noShowCount: number;
  }[];
  peakTimeSlots: {
    timeSlot: string;
    bookingCount: number;
    dayOfWeek: number;
  }[];
}

export interface AppState {
  currentRole: UserRole;
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  selectedRoomId: string | null;
}

export const PIANO_TYPE_LABELS: Record<PianoType, string> = {
  grand: '三角钢琴',
  upright: '立式钢琴',
  digital: '数码钢琴',
  hybrid: '混合钢琴',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: '可预约',
  maintenance: '维修中',
  temporarily_closed: '暂不可用',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: '已确认',
  cancelled: '已取消',
  no_show: '爽约',
  waitlist: '候补中',
  completed: '已完成',
};

export const TIME_SLOTS = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
];

export const FLOORS = [1, 2, 3, 4, 5];
