export type ItemType = '纸箱' | '旧家具' | '花盆' | '儿童车' | '自行车' | '杂物' | '其他';

export type InspectionStatus = 'pending' | 'notified' | 'cleaned' | 'overdue' | 'recheck';

export type NotificationMethod = '上门' | '电话' | '告示' | '微信' | '其他';

export type NotificationStatus = 'sent' | 'feedback_received' | 'overdue' | 'completed';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface Inspection {
  id: string;
  building: string;
  floor: string;
  location: string;
  itemType: ItemType;
  area: number;
  photo: string;
  suspectedResident: string;
  isFireExit: boolean;
  status: InspectionStatus;
  createdAt: string;
  updatedAt: string;
  cleanedAt?: string;
  cleanedPhoto?: string;
  recheckCount?: number;
}

export interface Notification {
  id: string;
  inspectionId: string;
  method: NotificationMethod;
  deadline: string;
  contactPerson: string;
  contactPhone: string;
  feedback?: string;
  feedbackAt?: string;
  status: NotificationStatus;
  createdAt: string;
  noticeCount: number;
}

export interface RecheckRecord {
  id: string;
  inspectionId: string;
  recheckDate: string;
  result: string;
  needsSecondNotice: boolean;
  remark: string;
}

export interface BuildingStats {
  building: string;
  totalCount: number;
  pendingCount: number;
  cleanedCount: number;
  overdueCount: number;
  fireExitCount: number;
}

export interface ResidentStats {
  resident: string;
  count: number;
  building: string;
  lastOccurrence: string;
}

export interface CleanupStats {
  avgDays: number;
  within3Days: number;
  within7Days: number;
  over7Days: number;
  totalCleaned: number;
}

export interface RiskPoint {
  location: string;
  building: string;
  floor: string;
  count: number;
  riskLevel: RiskLevel;
  isFireExit: boolean;
  lastOccurrence: string;
}

export interface DashboardStats {
  totalInspections: number;
  pendingCount: number;
  cleanedCount: number;
  overdueCount: number;
  fireExitCount: number;
}
