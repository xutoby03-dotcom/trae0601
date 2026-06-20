export type ConnectionType = 'bluetooth' | 'usb' | 'wireless_24g' | 'wired';
export type HeadsetStatus = 'available' | 'borrowed' | 'faulty' | 'maintenance';
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue';
export type PurchaseStatus = 'pending' | 'ordered' | 'received';

export interface Headset {
  id: string;
  brand: string;
  model: string;
  connectionType: ConnectionType;
  serialNumber: string;
  cabinet: string;
  compatibleSoftware: string[];
  batteryLevel: number;
  photo: string;
  status: HeadsetStatus;
  receiverLost: boolean;
  microphoneIssue: boolean;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  headsetId: string;
  meetingRoom: string;
  meetingTime: string;
  borrower: string;
  expectedReturn: string;
  needSpareReceiver: boolean;
  actualReturn?: string;
  status: BorrowStatus;
  createdAt: string;
}

export interface ReturnTest {
  id: string;
  borrowRecordId: string;
  soundTest: boolean;
  noiseCancellation: boolean;
  bluetoothTest: boolean;
  wireControl: boolean;
  appearance: boolean;
  notes?: string;
  createdAt: string;
}

export interface MeetingDemand {
  id: string;
  meetingTime: string;
  meetingRoom: string;
  headsetCount: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseNeed {
  id: string;
  brand: string;
  model: string;
  quantity: number;
  reason: string;
  status: PurchaseStatus;
  createdAt: string;
}

export const connectionTypeLabels: Record<ConnectionType, string> = {
  bluetooth: '蓝牙',
  usb: 'USB有线',
  wireless_24g: '2.4G无线',
  wired: '3.5mm有线',
};

export const headsetStatusLabels: Record<HeadsetStatus, string> = {
  available: '可借用',
  borrowed: '已借出',
  faulty: '故障',
  maintenance: '维修中',
};

export const borrowStatusLabels: Record<BorrowStatus, string> = {
  borrowed: '使用中',
  returned: '已归还',
  overdue: '逾期未还',
};

export const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  pending: '待采购',
  ordered: '已下单',
  received: '已入库',
};

export const meetingSoftwareOptions = [
  'Zoom',
  'Teams',
  '飞书',
  '钉钉',
  '企业微信',
  '腾讯会议',
  'Webex',
  'Skype',
];

export const cabinetOptions = [
  'A柜-1层',
  'A柜-2层',
  'A柜-3层',
  'B柜-1层',
  'B柜-2层',
  'B柜-3层',
  'C柜-1层',
  'C柜-2层',
];

export const meetingRoomOptions = [
  '会议室A101',
  '会议室A102',
  '会议室A201',
  '会议室B301',
  '会议室B302',
  '大会议室C401',
  '培训室D501',
];
