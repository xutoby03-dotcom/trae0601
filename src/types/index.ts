export type NoiseType = 'decoration' | 'square_dance' | 'furniture' | 'pet' | 'other';
export type ComplaintStatus = 'pending' | 'processing' | 'completed' | 'overdue';

export interface Attachment {
  id: string;
  type: 'image' | 'audio';
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export interface ProcessRecord {
  id: string;
  complaintId: string;
  contactPerson: string;
  persuasionResult: string;
  needHomeVisit: boolean;
  promisedTime: string;
  actualVisitTime?: string;
  remark: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  building: string;
  unit: string;
  timePeriod: string;
  noiseType: NoiseType;
  complainant: string;
  phone: string;
  description: string;
  attachments: Attachment[];
  processRecords: ProcessRecord[];
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  weeklyCount: number;
  repeatComplainants: number;
  avgProcessingTime: number;
  pendingCount: number;
  overdueCount: number;
  buildingStats: { building: string; count: number }[];
  noiseTypeStats: { type: string; count: number; label: string }[];
}

export const NOISE_TYPE_LABELS: Record<NoiseType, string> = {
  decoration: '装修噪音',
  square_dance: '广场音响',
  furniture: '搬运家具',
  pet: '宠物噪音',
  other: '其他噪音',
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  overdue: '已超期',
};

export const BUILDINGS = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼', '7号楼', '8号楼'];
