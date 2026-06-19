export type VoicePart = "女高音" | "女低音" | "男高音" | "男低音" | "童声";

export type ClothingCategory = "上衣" | "裙裤" | "鞋子" | "领结" | "发饰";

export type ClothingStatus = "完好" | "待修" | "改衣中" | "遗失" | "清洗中";

export type RecordType = "改衣" | "换码" | "遗失" | "归还清洗";

export type RecordStatus = "待处理" | "处理中" | "已完成";

export interface Student {
  id: string;
  name: string;
  className: string;
  height: number;
  weight: number;
  shoeSize: number;
  voicePart: VoicePart;
  needAlter: boolean;
  contact: string;
  createdAt: string;
}

export interface ClothingItem {
  id: string;
  category: ClothingCategory;
  size: string;
  quantity: number;
  status: ClothingStatus;
  photoUrl?: string;
  setNumber?: string;
  updatedAt: string;
}

export interface Distribution {
  id: string;
  studentId: string;
  clothingIds: string[];
  setNumber: string;
  isFit: boolean;
  distributedAt: string;
  distributedBy: string;
  isReturned: boolean;
}

export interface ProcessRecord {
  id: string;
  type: RecordType;
  studentId: string;
  clothingId?: string;
  description: string;
  status: RecordStatus;
  createdAt: string;
  operator: string;
}

export interface DashboardStats {
  totalStudents: number;
  distributedCount: number;
  pendingAlter: number;
  notReturned: number;
  voicePartProgress: { part: VoicePart; total: number; distributed: number; percent: number }[];
  sizeShortage: { category: ClothingCategory; size: string; needed: number; available: number }[];
  pendingStudents: Student[];
  pendingRecords: ProcessRecord[];
}
