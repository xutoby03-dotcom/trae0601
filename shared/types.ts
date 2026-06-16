export interface User {
  id: number;
  employeeId: string;
  name: string;
  role: 'employee' | 'admin';
  creditScore: number;
  createdAt: string;
}

export interface Chair {
  id: number;
  chairNumber: string;
  location: string;
  items: string[];
  lastCleanedAt: string | null;
  lastCleanedBy: number | null;
  lastCleanedByName: string | null;
  photoUrls: string[];
  status: 'available' | 'in_use' | 'dirty' | 'maintenance';
}

export interface Booking {
  id: number;
  userId: number;
  userName: string;
  chairId: number;
  chairNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'checked_in' | 'completed' | 'no_show' | 'cancelled';
  checkedInAt: string | null;
  endedAt: string | null;
  cleanupConfirmed: boolean;
  damageReported: boolean;
  damageNote: string | null;
}

export interface DamageRecord {
  id: number;
  chairId: number;
  chairNumber: string;
  bookingId: number;
  reportedBy: number;
  reporterName: string;
  partName: string;
  description: string;
  reportedAt: string;
  status: 'reported' | 'repaired';
}

export interface BookingCreateRequest {
  chairId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CleanupConfirmRequest {
  folded: boolean;
  cushionInPlace: boolean;
  blanketReturned: boolean;
  wipedClean: boolean;
  damageReported: boolean;
  damageNote?: string;
  damagePart?: string;
}

export interface UsageStats {
  date: string;
  totalSlots: number;
  usedSlots: number;
  usageRate: number;
}

export interface PopularTimeSlot {
  time: string;
  count: number;
}

export interface NoShowRecord {
  userId: number;
  userName: string;
  employeeId: string;
  count: number;
  totalPenalty: number;
}

export interface DamagePartStats {
  partName: string;
  count: number;
}

export interface LoginRequest {
  employeeId: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string;
}
