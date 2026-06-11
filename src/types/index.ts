export type PackageStatus = 'new' | 'pending' | 'picked_up' | 'abnormal';

export interface PackageItem {
  id: string;
  recipientName: string;
  recipientPhone: string;
  department: string;
  courierCompany: string;
  pickupCode: string;
  shelfLocation: string;
  isFragile: boolean;
  isColdChain: boolean;
  photos: string[];
  status: PackageStatus;
  createdAt: string;
  pickedUpAt?: string;
  signedBy?: string;
  phoneTailVerified: boolean;
}

export interface PackageFilters {
  status?: PackageStatus;
  department?: string;
  courierCompany?: string;
  isFragile?: boolean;
  isColdChain?: boolean;
  isOverdue?: boolean;
}

export interface StatsData {
  dailyArrivals: { date: string; count: number }[];
  departmentRanking: { department: string; count: number }[];
  overdueCount: number;
  avgPickupHours: number;
  coldChainOverdueRatio: number;
}

export const DEPARTMENTS = [
  '技术部',
  '产品部',
  '设计部',
  '市场部',
  '运营部',
  '人事部',
  '财务部',
  '行政部',
];

export const COURIER_COMPANIES = [
  '顺丰速运',
  '京东物流',
  '中通快递',
  '圆通速递',
  '韵达快递',
  '申通快递',
  '极兔速递',
  'ems',
  '丹鸟物流',
  '菜鸟裹裹',
];

export const STATUS_LABELS: Record<PackageStatus, string> = {
  new: '新到',
  pending: '待领取',
  picked_up: '已领取',
  abnormal: '异常',
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  new: 'bg-indigo-500',
  pending: 'bg-amber-500',
  picked_up: 'bg-emerald-500',
  abnormal: 'bg-coral-500',
};

export const COLD_CHAIN_TIMEOUT_HOURS = 4;
export const NORMAL_TIMEOUT_HOURS = 48;
