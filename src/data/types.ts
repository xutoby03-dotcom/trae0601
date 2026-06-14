export type RemoteStatus = 'available' | 'borrowed' | 'maintenance' | 'lost';
export type BorrowStatus = 'borrowing' | 'returned' | 'overdue' | 'lost';
export type PurchaseStatus = 'pending' | 'approved' | 'purchased' | 'stocked';
export type NotificationType = 'overdue' | 'lowBattery' | 'maintenance';

export interface Remote {
  id: string;
  code: string;
  conferenceRoom: string;
  batteryModel: string;
  storageLocation: string;
  photoUrl: string;
  status: RemoteStatus;
  batteryLevel: number;
  lastBatteryChange: string;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  remoteId: string;
  borrower: string;
  department: string;
  conferenceRoom: string;
  borrowTime: string;
  expectedReturn: string;
  purpose: string;
  actualReturn?: string;
  returnBatteryLevel?: number;
  hasDamage?: boolean;
  inOriginalBox?: boolean;
  status: BorrowStatus;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  remoteId?: string;
  reason: string;
  applicant: string;
  applyDate: string;
  approver?: string;
  approveDate?: string;
  status: PurchaseStatus;
  purchaseChannel?: string;
  cost?: number;
  purchaseDate?: string;
  stockDate?: string;
  newRemoteId?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  remoteId: string;
  recordId?: string;
  timestamp: string;
  read: boolean;
}

export const DEPARTMENTS = [
  '技术部', '产品部', '运营部', '市场部', '人事部', '财务部'
];

export const CONFERENCE_ROOMS = [
  '1楼-培训室', '2楼-大会议室', '2楼-小会议室', 
  '3楼-董事会议室', '3楼-洽谈室', '5楼-多功能厅'
];

export const BATTERY_MODELS = ['AA', 'AAA', 'CR2032'];

export const STATUS_LABELS: Record<RemoteStatus, string> = {
  available: '可用',
  borrowed: '借用中',
  maintenance: '维修中',
  lost: '已丢失'
};

export const BORROW_STATUS_LABELS: Record<BorrowStatus, string> = {
  borrowing: '借用中',
  returned: '已归还',
  overdue: '已逾期',
  lost: '已丢失'
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: '待审批',
  approved: '审批通过',
  purchased: '已采购',
  stocked: '已入库'
};

export const STATUS_COLORS: Record<RemoteStatus, string> = {
  available: 'bg-green-100 text-green-800',
  borrowed: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  lost: 'bg-red-100 text-red-800'
};
