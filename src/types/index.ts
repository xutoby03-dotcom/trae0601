export type RoomType = 'piano' | 'drum' | 'vocal';

export type BookingStatus = 'pending' | 'in_use' | 'completed' | 'cancelled' | 'needs_cleaning';

export type PracticeType = 'piano_solo' | 'piano_duet' | 'drum_practice' | 'vocal_solo' | 'vocal_group' | 'band_practice' | 'other';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  hasMusicStand: boolean;
  hasExternalSpeaker: boolean;
  floor: string;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  practiceType: PracticeType;
  peopleCount: number;
  needMusicStand: boolean;
  hasExternalSpeaker: boolean;
  status: BookingStatus;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  bookingId: string;
  roomId: string;
  noiseRating: number;
  cleanlinessRating: number;
  equipmentRating: number;
  overallRating: number;
  noiseIssue?: string;
  cleanlinessIssue?: string;
  equipmentIssue?: string;
  comments?: string;
  createdAt: string;
}

export interface EquipmentIssue {
  id: string;
  roomId: string;
  reportedBy: string;
  reportedAt: string;
  category: 'keyboard' | 'drum' | 'ac' | 'speaker' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedAt?: string;
  resolvedNote?: string;
}

export interface Notification {
  id: string;
  bookingId: string;
  type: 'overdue_checkout' | 'upcoming_booking';
  message: string;
  createdAt: string;
  read: boolean;
}
