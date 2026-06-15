export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface Maintenance {
  id: string;
  elevatorId: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface Elevator {
  id: string;
  name: string;
  building: string;
  unit: string;
  maxLoad: number;
  allowsProtectionMat: boolean;
  status: 'active' | 'maintenance' | 'disabled';
  maintenanceSchedule?: Maintenance[];
  createdAt?: string;
}

export interface Reservation {
  id: string;
  building: string;
  unit: string;
  floor: number;
  movingCompany: string;
  vehicleInfo: string;
  estimatedItems: number;
  estimatedWeight: number;
  needsProtectionMat: boolean;
  date: string;
  startTime: string;
  endTime: string;
  elevatorId: string;
  status: 'pending' | 'approved' | 'conflict' | 'completed' | 'cancelled';
  createdAt?: string;
  elevator?: Elevator;
}

export interface CompletionRecord {
  id: string;
  reservationId: string;
  protectionMatReturned: boolean;
  wallDamage: 'none' | 'minor' | 'major';
  wallDamageDescription?: string;
  depositStatus: 'collected' | 'refunded' | 'deducted';
  depositAmount?: number;
  completedAt?: string;
  needsInspection: boolean;
}

export interface Inspection {
  id: string;
  reservationId: string;
  floor: number;
  unit: string;
  status: 'pending' | 'completed';
  notes?: string;
  createdAt?: string;
}

export interface ConflictCheckRequest {
  elevatorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reservationId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingReservations?: Reservation[];
  message?: string;
}

export interface WeightCheckRequest {
  elevatorId: string;
  estimatedWeight: number;
}

export interface WeightCheckResult {
  isOverloaded: boolean;
  elevatorMaxLoad: number;
  estimatedWeight: number;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
