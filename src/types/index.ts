export type UrgencyLevel = 'normal' | 'urgent';
export type TicketStatus = 'pending' | 'processing' | 'waiting_parts' | 'completed';
export type UserRole = 'student' | 'worker' | 'admin';

export interface Photo {
  id: string;
  url: string;
  uploadedAt: string;
  uploader: 'student' | 'worker';
}

export interface Message {
  id: string;
  sender: 'student' | 'worker' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Review {
  rating: number;
  comment: string;
  photos: Photo[];
  createdAt: string;
}

export interface JumpReason {
  reason: string;
  operator: string;
  timestamp: string;
}

export interface StatusHistoryEntry {
  status: TicketStatus;
  timestamp: string;
  operator?: string;
}

export interface Ticket {
  id: string;
  studentName: string;
  building: string;
  room: string;
  faultType: string;
  description: string;
  photos: Photo[];
  urgency: UrgencyLevel;
  availableTimes: string[];
  status: TicketStatus;
  queuePosition?: number;
  estimatedArrival?: string;
  assignedWorker?: string;
  messages: Message[];
  review?: Review;
  jumpReasons: JumpReason[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface Stats {
  avgProcessingTime: number;
  pendingCount: number;
  processingCount: number;
  waitingPartsCount: number;
  todayCompleted: number;
  totalCount: number;
  faultTypeDistribution: { type: string; count: number }[];
  buildingDistribution: { building: string; count: number }[];
}

export const BUILDINGS = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼', '7号楼', '8号楼'];

export const FAULT_TYPES = ['水管漏水', '电路故障', '门锁损坏', '空调故障', '灯具损坏', '卫浴故障', '家具损坏', '网络故障'];

export const TIME_SLOTS = [
  '周一至周五 上午 08:00-12:00',
  '周一至周五 下午 14:00-18:00',
  '周一至周五 晚间 19:00-21:00',
  '周六 上午 09:00-12:00',
  '周六 下午 14:00-18:00',
  '周日 上午 09:00-12:00',
  '周日 下午 14:00-18:00',
];

export const WORKERS = ['张师傅', '李师傅', '王师傅', '赵师傅'];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  pending: '待接单',
  processing: '处理中',
  waiting_parts: '等配件',
  completed: '已完成',
};

export const STATUS_COLOR: Record<TicketStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  processing: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  waiting_parts: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};
