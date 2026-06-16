export type InterfaceType = 'USB-C' | 'Micro-USB' | 'Lightning';

export type CableStatus = 'available' | 'borrowed' | 'maintaining' | 'scrapped';

export type BorrowStatus = 'borrowing' | 'returned' | 'overdue';

export type ReturnStatus = 'normal' | 'damaged' | 'scrapped';

export type DamageType = 'skin' | 'interface' | 'charging';

export type AlertType = 'overdue' | 'damaged' | 'low_stock';

export type AlertLevel = 'warning' | 'danger';

export interface Cable {
  id: string;
  code: string;
  interfaceType: InterfaceType;
  length: number;
  power: number;
  defaultLocation: string;
  status: CableStatus;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  borrowCount: number;
}

export interface BorrowRecord {
  id: string;
  cableId: string;
  employeeName: string;
  employeeNo: string;
  department: string;
  device: string;
  expectedReturn: string;
  purpose: string;
  borrowTime: string;
  returnTime?: string;
  status: BorrowStatus;
  damageReport?: string;
  damageType?: DamageType;
  returnStatus?: ReturnStatus;
}

export interface Employee {
  id: string;
  name: string;
  employeeNo: string;
  department: string;
  floor: string;
  isAdmin: boolean;
}

export interface Alert {
  id: string;
  type: AlertType;
  cableId?: string;
  borrowId?: string;
  interfaceType?: InterfaceType;
  message: string;
  level: AlertLevel;
  isRead: boolean;
  createdAt: string;
}

export interface Statistics {
  totalCables: number;
  availableCables: number;
  borrowedCables: number;
  overdueCount: number;
  totalBorrowCount: number;
  lossRate: number;
  floorDemand: { floor: string; count: number }[];
  interfaceDemand: { type: InterfaceType; count: number }[];
  interfaceStock: { type: InterfaceType; available: number; total: number; safeStock: number }[];
  topBorrowed: { cable: Cable; count: number }[];
  monthlyTrend: { month: string; borrowCount: number; returnCount: number }[];
  damageDistribution: { type: DamageType; count: number }[];
}

export interface SystemConfig {
  safeStock: number;
  overdueHours: number;
  maxBorrowPerPerson: number;
}

export const INTERFACE_TYPE_LABELS: Record<InterfaceType, string> = {
  'USB-C': 'USB-C',
  'Micro-USB': 'Micro-USB',
  'Lightning': 'Lightning',
};

export const CABLE_STATUS_LABELS: Record<CableStatus, string> = {
  available: '可用',
  borrowed: '借出',
  maintaining: '维修中',
  scrapped: '报废',
};

export const BORROW_STATUS_LABELS: Record<BorrowStatus, string> = {
  borrowing: '借用中',
  returned: '已归还',
  overdue: '已逾期',
};

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  skin: '外皮破损',
  interface: '接口松动',
  charging: '充电异常',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  overdue: '逾期未还',
  damaged: '损坏未报',
  low_stock: '库存不足',
};
