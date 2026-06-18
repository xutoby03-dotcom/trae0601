export type FurnitureStatus = 'normal' | 'pending_repair' | 'under_maintenance' | 'out_of_service';

export type FurnitureType = 'table' | 'chair';

export type IssueType = 'wobble' | 'crack' | 'uneven_legs' | 'peeling' | 'drawer_stuck' | 'backrest_loose';

export type Severity = 'low' | 'medium' | 'high';

export type RepairStatus = 'pending' | 'processing' | 'assigned' | 'completed' | 'closed';

export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'verified';

export type InspectionResult = 'normal' | 'issue' | 'out_of_service';

export interface Furniture {
  id: string;
  room: string;
  type: FurnitureType;
  purchaseDate: string;
  weightCapacity: number;
  lastInspection: string;
  status: FurnitureStatus;
  photos: string[];
  createdAt: string;
}

export interface RepairOrder {
  id: string;
  furnitureId: string;
  reporter: string;
  issueType: IssueType;
  description: string;
  severity: Severity;
  status: RepairStatus;
  photos: string[];
  createdAt: string;
}

export interface InspectionRecord {
  id: string;
  room: string;
  inspector: string;
  inspectDate: string;
  furnitureId: string;
  result: InspectionResult;
  remark: string;
}

export interface MaintenanceRecord {
  id: string;
  repairOrderId: string;
  furnitureId: string;
  handler: string;
  parts: string;
  cost: number;
  reviewPhotos: string[];
  finishDate: string;
  status: MaintenanceStatus;
  createdAt: string;
}

export interface RoomInfo {
  id: string;
  name: string;
  furnitureCount: number;
}

export const FURNITURE_STATUS_LABELS: Record<FurnitureStatus, string> = {
  normal: '正常使用',
  pending_repair: '待修',
  under_maintenance: '维修中',
  out_of_service: '停用',
};

export const FURNITURE_TYPE_LABELS: Record<FurnitureType, string> = {
  table: '桌子',
  chair: '椅子',
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  wobble: '晃动',
  crack: '裂纹',
  uneven_legs: '椅脚不平',
  peeling: '桌面起皮',
  drawer_stuck: '抽屉卡住',
  backrest_loose: '靠背松动',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: '轻微',
  medium: '一般',
  high: '严重',
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  assigned: '已派单',
  completed: '已完成',
  closed: '已关闭',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: '待维修',
  in_progress: '维修中',
  completed: '已完成',
  verified: '已验收',
};

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  normal: '正常',
  issue: '有问题',
  out_of_service: '停用',
};

export const ROOMS = ['活动室A', '活动室B', '棋牌室C', '棋牌室D'];
