export type VehicleStatus = "normal" | "suspicious" | "charging_occupied" | "contacted";

export type VehicleType = "电动车" | "自行车" | "摩托车" | "三轮车";

export type DisposalType = "车主挪走" | "清运" | "其他";

export interface Area {
  id: string;
  name: string;
  capacity: number;
  chargingCapacity: number;
  hasCharging: boolean;
  manager: string;
  photoUrl: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  ownerPhone: string;
  areaId: string;
  photoUrl: string;
  status: VehicleStatus;
  lastMovedAt: string;
  createdAt: string;
}

export interface Patrol {
  id: string;
  vehicleId: string;
  areaId: string;
  status: VehicleStatus;
  remark: string;
  photoUrl: string;
  patrolTime: string;
  patrolUser: string;
}

export interface Disposal {
  id: string;
  vehicleId: string;
  areaId: string;
  disposalType: DisposalType;
  disposalTime: string;
  photoUrl: string;
  remark: string;
  handledBy: string;
  createdAt: string;
}

export interface DashboardAreaStat {
  id: string;
  name: string;
  capacity: number;
  used: number;
  remaining: number;
  chargingUsed: number;
  chargingCapacity: number;
  suspiciousCount: number;
}

export interface DashboardData {
  areas: DashboardAreaStat[];
  totalVehicles: number;
  totalSuspicious: number;
  pendingDisposals: number;
}

export interface VehicleWithArea extends Vehicle {
  areaName: string;
}

export interface PatrolWithDetails extends Patrol {
  plateNumber: string;
  areaName: string;
  vehiclePhotoUrl: string;
}

export interface DisposalWithDetails extends Disposal {
  plateNumber: string;
  areaName: string;
  vehiclePhotoUrl: string;
  ownerPhone: string;
  daysUnmoved: number;
}
