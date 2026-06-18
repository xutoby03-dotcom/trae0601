export type PackageSize = 'S' | 'M' | 'L';

export type PackageStatus = 'stored' | 'picked' | 'exception' | 'transferred';

export type DelayLevel = 'normal' | 'warning' | 'danger' | 'critical';

export type ExceptionType = 'damaged' | 'wrong_pickup' | 'unclaimed';

export type ReminderType = 'auto_24h' | 'auto_48h' | 'manual_72h';

export type ReminderLevel = 'warning' | 'danger' | 'critical';

export interface Shelf {
  id: string;
  name: string;
  area: string;
  floorCount: number;
  slotsPerFloor: number;
  cameraPoint: string;
  manager: string;
  managerPhone: string;
  createdAt: string;
}

export interface ShelfSlot {
  id: string;
  shelfId: string;
  floor: number;
  slotNumber: number;
  sizeLevel: PackageSize;
  isOccupied: boolean;
}

export interface PackageItem {
  id: string;
  shelfId: string;
  shelfSlotId: string;
  slotLabel: string;
  recipientName: string;
  phoneLast4: string;
  courierCompany: string;
  packageSize: PackageSize;
  photoUrl: string;
  storedAt: string;
  status: PackageStatus;
  pickupCode: string;
  pickedAt?: string;
  pickupName?: string;
}

export interface ExceptionRecord {
  id: string;
  packageId: string;
  recipientName: string;
  slotLabel: string;
  type: ExceptionType;
  description: string;
  handler: string;
  createdAt: string;
}

export interface ReminderLog {
  id: string;
  packageId: string;
  recipientName: string;
  slotLabel: string;
  type: ReminderType;
  level: ReminderLevel;
  remindedAt: string;
  operator?: string;
  result?: string;
}

export interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  occupancyRate: number;
  storedCount: number;
  delayed24hCount: number;
  delayed72hCount: number;
  todayPickedCount: number;
}

export interface HourlyData {
  hour: number;
  stored: number;
  picked: number;
}

export interface CourierDelayData {
  name: string;
  total: number;
  delayed: number;
  rate: number;
}

export const COURIER_COMPANIES = [
  '顺丰速运',
  '京东物流',
  '中通快递',
  '圆通速递',
  '申通快递',
  '韵达快递',
  '极兔速递',
  '邮政EMS',
  '德邦快递',
];

export const EXCEPTION_TYPE_LABEL: Record<ExceptionType, string> = {
  damaged: '包裹破损',
  wrong_pickup: '错拿包裹',
  unclaimed: '无人认领',
};

export const REMINDER_TYPE_LABEL: Record<ReminderType, string> = {
  auto_24h: '24h自动提醒',
  auto_48h: '48h自动提醒',
  manual_72h: '72h人工处理',
};
