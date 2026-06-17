export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export type SoundproofLevel = 'basic' | 'standard' | 'high' | 'professional';

export type NoiseLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface Instrument {
  id: string;
  name: string;
  noiseLevel: NoiseLevel;
  icon: string;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  soundproofLevel: SoundproofLevel;
  openTimeStart: string;
  openTimeEnd: string;
  availableInstruments: string[];
  photos: string[];
  color: string;
}

export type BookingStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'waiting_checkin'
  | 'checked_in'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  instrumentId: string;
  piece: string;
  peopleCount: number;
  needMusicStand: boolean;
  expectedVolume: NoiseLevel;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  parentBookingId?: string;
  createdAt: Date;
}

export type RepairStatus = 'pending' | 'processing' | 'completed';

export interface Repair {
  id: string;
  roomId: string;
  bookingId?: string;
  reporterId: string;
  equipmentName: string;
  description: string;
  photos: string[];
  status: RepairStatus;
  createdAt: Date;
  completedAt?: Date;
}
