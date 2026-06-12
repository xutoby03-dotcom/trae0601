export type DeviceStatus = 'available' | 'borrowed' | 'repairing' | 'scrapped';
export type BorrowStatus = 'borrowing' | 'returned' | 'overdue';
export type RepairStatus = 'repairing' | 'completed' | 'cancelled';
export type AppearanceStatus = 'good' | 'minor_damage' | 'damaged';

export interface AccessoryItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface Device {
  id: string;
  code: string;
  category: DeviceCategory;
  status: DeviceStatus;
  purchaseDate: string;
  custodian: string;
  value: number;
  photo: string;
  description?: string;
  createdAt: string;
}

export interface Borrow {
  id: string;
  deviceId: string;
  purpose: string;
  borrower: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  accessories: AccessoryItem[];
  returnChecklist?: {
    accessories: AccessoryItem[];
    appearance: AppearanceStatus;
    note?: string;
  };
}

export interface Repair {
  id: string;
  deviceId: string;
  borrowId?: string;
  faultDescription: string;
  handler: string;
  cost: number;
  status: RepairStatus;
  beforePhoto?: string;
  afterPhoto?: string;
  startDate: string;
  completeDate?: string;
  remark?: string;
}

export const DEVICE_CATEGORIES = [
  '投影仪',
  '录音笔',
  '小相机',
  '笔记本电脑',
  '平板',
  '其他',
] as const;
export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  available: '可用',
  borrowed: '借用中',
  repairing: '维修中',
  scrapped: '已报废',
};

export const DEVICE_STATUS_COLORS: Record<DeviceStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  borrowed: 'bg-blue-100 text-blue-700',
  repairing: 'bg-amber-100 text-amber-700',
  scrapped: 'bg-slate-100 text-slate-600',
};

export const BORROW_STATUS_LABELS: Record<BorrowStatus, string> = {
  borrowing: '借用中',
  returned: '已归还',
  overdue: '逾期未还',
};

export const BORROW_STATUS_COLORS: Record<BorrowStatus, string> = {
  borrowing: 'bg-blue-100 text-blue-700',
  returned: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-rose-100 text-rose-700',
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  repairing: '维修中',
  completed: '已完成',
  cancelled: '已取消',
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  repairing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export const APPEARANCE_LABELS: Record<AppearanceStatus, string> = {
  good: '外观完好',
  minor_damage: '轻微划痕',
  damaged: '明显损坏',
};
