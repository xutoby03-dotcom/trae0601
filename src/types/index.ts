export type FacilityStatus = 'normal' | 'needs_repair' | 'out_of_service';

export type FacilityType = 'slide' | 'swing' | 'climbing_frame' | 'seesaw' | 'carousel' | 'other';

export type InspectionItemKey = 'handrail' | 'pedal' | 'slide_surface' | 'guardrail' | 'floor_mat' | 'screw' | 'water_logging' | 'sharp_edge';

export type IssueLevel = 'minor' | 'needs_repair' | 'out_of_service';

export type IssueStatus = 'pending' | 'confirmed' | 'resolved' | 'closed';

export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed';

export interface Facility {
  id: string;
  name: string;
  location: string;
  type: FacilityType;
  material: string;
  ageRange: string;
  installDate: string;
  maintenanceUnit: string;
  photo: string;
  status: FacilityStatus;
  area: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItem {
  key: InspectionItemKey;
  name: string;
  isNormal: boolean;
  remark?: string;
  photo?: string;
}

export interface InspectionRecord {
  id: string;
  facilityId: string;
  inspectionDate: string;
  inspector: string;
  status: 'pending' | 'completed';
  remark?: string;
  photos: string[];
  items: InspectionItem[];
  createdAt: string;
}

export interface IssueRecord {
  id: string;
  facilityId: string;
  title: string;
  description: string;
  photos: string[];
  reporter: string;
  reportDate: string;
  level?: IssueLevel;
  status: IssueStatus;
  handlerRemark?: string;
  handledAt?: string;
}

export interface RepairRecord {
  id: string;
  facilityId: string;
  issueId?: string;
  title: string;
  handler: string;
  materials: string;
  repairDate: string;
  result: string;
  reopenDate?: string;
  status: RepairStatus;
  reviewer?: string;
  reviewResult?: string;
  reviewDate?: string;
  createdAt: string;
}

export const INSPECTION_ITEMS: { key: InspectionItemKey; name: string; icon: string }[] = [
  { key: 'handrail', name: '扶手', icon: 'Hand' },
  { key: 'pedal', name: '踏板', icon: 'Footprints' },
  { key: 'slide_surface', name: '滑面', icon: 'ArrowDown' },
  { key: 'guardrail', name: '防护栏', icon: 'Shield' },
  { key: 'floor_mat', name: '地垫', icon: 'LayoutGrid' },
  { key: 'screw', name: '螺丝', icon: 'Wrench' },
  { key: 'water_logging', name: '积水', icon: 'Droplets' },
  { key: 'sharp_edge', name: '尖锐边缘', icon: 'AlertTriangle' },
];

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  slide: '滑梯',
  swing: '秋千',
  climbing_frame: '攀爬架',
  seesaw: '跷跷板',
  carousel: '转椅',
  other: '其他',
};

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
  normal: '正常使用',
  needs_repair: '待维修',
  out_of_service: '已停用',
};

export const ISSUE_LEVEL_LABELS: Record<IssueLevel, string> = {
  minor: '轻微',
  needs_repair: '需维修',
  out_of_service: '立即停用',
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  pending: '待处理',
  confirmed: '已确认',
  resolved: '已解决',
  closed: '已关闭',
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: '待处理',
  in_progress: '维修中',
  completed: '已完成',
  reviewed: '已复查',
};
