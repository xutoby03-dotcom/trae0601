export type DeviceStatus = 'IDLE' | 'OCCUPIED' | 'CLEANING_PENDING' | 'PAUSED' | 'MAINTENANCE';

export type PetSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type BookingStatus = 'PENDING' | 'IN_USE' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export type TaskType = 'MAT_REPLACEMENT' | 'DRAIN_CLEANING' | 'DISINFECTANT_REFILL';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type UserRole = 'RESIDENT' | 'CLEANER' | 'ADMIN';

export interface WashingPool {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  lastCleanedAt?: Date;
}

export interface PetInfo {
  nickname: string;
  size: PetSize;
  building: string;
  ownerPhone: string;
  afraidOfWater: boolean;
}

export interface Booking {
  id: string;
  poolId: string;
  poolName: string;
  date: string;
  timeSlot: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  petInfo: PetInfo;
  status: BookingStatus;
  feedback?: {
    waterSpilled: boolean;
    floorNeedsMopping: boolean;
    usedDisinfectant: boolean;
  };
  createdAt: Date;
}

export interface CleaningTask {
  id: string;
  poolId: string;
  poolName: string;
  type: TaskType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  note?: string;
}

export interface Statistics {
  peakHours: { hour: number; count: number }[];
  noShows: {
    total: number;
    rate: number;
    users: { phone: string; count: number }[];
  };
  overtimeUsage: {
    total: number;
    avgDuration: number;
    overtimes: { poolId: string; count: number }[];
  };
  buildingUsage: { building: string; count: number }[];
}
