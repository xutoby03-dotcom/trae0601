export type PackageSize = 'S' | 'M' | 'L' | 'XL';

export type PackageStatus = 'waiting' | 'picked' | 'abnormal';

export type CourierCompany =
  | '顺丰' | '京东' | '圆通' | '中通' | '申通' | '韵达'
  | '极兔' | '德邦' | '邮政' | '其他';

export type LockerStatus = 'free' | 'occupied' | 'disabled';

export interface Package {
  id: string;
  recipientName: string;
  phoneLast4: string;
  company: CourierCompany;
  trackingNumber: string;
  lockerId: string;
  lockerCode?: string;
  size: PackageSize;
  isCod: boolean;
  isFragile: boolean;
  isColdChain: boolean;
  photoUrl?: string;
  status: PackageStatus;
  createdAt: string;
  pickedAt?: string;
  pickedBy?: string;
  isProxy?: boolean;
  proxyName?: string;
  proxyPhone?: string;
  abnormalReason?: string;
}

export interface Locker {
  id: string;
  code: string;
  zone: string;
  size: PackageSize;
  status: LockerStatus;
}

export interface StatsSummary {
  totalWaiting: number;
  totalOverdue: number;
  lockerOccupancy: number;
  totalToday: number;
  pickedToday: number;
  totalLockers: number;
  occupiedLockers: number;
  freeLockers: number;
}

export interface CompanyStats {
  company: CourierCompany;
  count: number;
}

export interface AbnormalRecord {
  id: string;
  recipientName: string;
  company: CourierCompany;
  trackingNumber: string;
  abnormalReason: string;
  createdAt: string;
  pickedAt: string;
}

export interface PickupPayload {
  pickedBy: string;
  isProxy: boolean;
  proxyName?: string;
  proxyPhone?: string;
}

export interface CreatePackagePayload {
  recipientName: string;
  phoneLast4: string;
  company: CourierCompany;
  trackingNumber: string;
  lockerId: string;
  size: PackageSize;
  isCod: boolean;
  isFragile: boolean;
  isColdChain: boolean;
  photoUrl?: string;
}
