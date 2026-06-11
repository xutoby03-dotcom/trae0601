export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type AppointmentStatus = 
  | 'booked' 
  | 'checked-in' 
  | 'serving' 
  | 'completed' 
  | 'no-show' 
  | 'waitlist';

export interface HaircutEvent {
  id: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  barberCount: number;
  durationPerPerson: number;
  totalCapacity: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  eventId: string;
  time: string;
  capacity: number;
  bookedCount: number;
}

export interface Appointment {
  id: string;
  eventId: string;
  slotId: string | null;
  elderName: string;
  age: number;
  phone: string;
  mobilityIssue: boolean;
  preferredTime: string;
  status: AppointmentStatus;
  queueNumber: number | null;
  postponeCount: number;
  checkInTime: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface EventStats {
  totalAppointments: number;
  checkedInCount: number;
  completedCount: number;
  noShowCount: number;
  waitlistCount: number;
  noShowRate: number;
  servingCount: number;
}

export interface TimeSlotStats {
  time: string;
  count: number;
}

export interface DailyStats {
  date: string;
  total: number;
  completed: number;
  noShow: number;
}
