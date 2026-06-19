export type BoxStatus = 'active' | 'maintenance' | 'scrapped' | 'pending_cleaning';

export type UsageType = 'hot_food' | 'cold_drink' | 'mixed';

export type IssueType = 'damage' | 'odor' | 'insulation' | 'leakage';

export type MaintenanceStatus = 'pending' | 'in_progress' | 'repaired' | 'scrapped';

export type OrderType = 'hot_food' | 'cold_drink' | 'other';

export interface Box {
  id: string;
  boxNumber: string;
  capacity: number;
  usageType: UsageType;
  riderId: string;
  purchaseDate: string;
  photoUrl: string;
  status: BoxStatus;
  createdAt: string;
}

export interface CleaningRecord {
  id: string;
  boxId: string;
  cleaningDate: string;
  residueRemoved: boolean;
  interiorWiped: boolean;
  disinfected: boolean;
  dried: boolean;
  zipperChecked: boolean;
  odorChecked: boolean;
  remarks: string;
  cleanedBy: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  boxId: string;
  issueType: IssueType;
  description: string;
  status: MaintenanceStatus;
  resolution: string;
  reportedDate: string;
  resolvedDate: string;
  reportedBy: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  employeeId: string;
  createdAt: string;
}

export interface UsageLog {
  id: string;
  boxId: string;
  riderId: string;
  orderId: string;
  usageDate: string;
  orderType: OrderType;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  orderDate: string;
  status: string;
}

export const BOX_STATUS_LABELS: Record<BoxStatus, string> = {
  active: '正常使用',
  maintenance: '维修中',
  scrapped: '已报废',
  pending_cleaning: '待清洁',
};

export const USAGE_TYPE_LABELS: Record<UsageType, string> = {
  hot_food: '热食专用',
  cold_drink: '冷饮专用',
  mixed: '混合使用',
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  damage: '破损',
  odor: '异味',
  insulation: '保温差',
  leakage: '汤汁渗漏',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: '待处理',
  in_progress: '处理中',
  repaired: '已维修',
  scrapped: '已报废',
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  hot_food: '热食',
  cold_drink: '冷饮',
  other: '其他',
};

export const CLEANING_STEPS = [
  { key: 'residueRemoved', label: '倒残渣', icon: 'Trash2' },
  { key: 'interiorWiped', label: '擦内胆', icon: 'Sparkles' },
  { key: 'disinfected', label: '消毒', icon: 'Droplets' },
  { key: 'dried', label: '晾干', icon: 'Sun' },
  { key: 'zipperChecked', label: '检查拉链', icon: 'Lock' },
  { key: 'odorChecked', label: '闻味道', icon: 'Wind' },
] as const;

export type CleaningStepKey = typeof CLEANING_STEPS[number]['key'];
