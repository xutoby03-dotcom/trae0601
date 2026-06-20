export type ClassroomStatus = 'normal' | 'suspended' | 'maintenance';

export type InspectionItemType =
  | 'edge_lifting'
  | 'bubbling'
  | 'cracking'
  | 'water_accumulation'
  | 'glue_stain'
  | 'mirror_surface'
  | 'handrail'
  | 'hvac';

export type InspectionStatus = 'normal' | 'warning' | 'critical';

export type InspectorRole = 'teacher' | 'club_leader' | 'admin';

export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'recheck_failed';

export type RecheckResult = 'passed' | 'failed';

export interface Classroom {
  id: string;
  name: string;
  floor: number;
  area: number;
  floorBrand: string;
  installDate: string;
  clubs: string[];
  photos: string[];
  status: ClassroomStatus;
  lastInspectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItem {
  type: InspectionItemType;
  status: InspectionStatus;
  description?: string;
  severity?: number;
}

export interface Inspection {
  id: string;
  classroomId: string;
  classroomName?: string;
  inspectorName: string;
  inspectorRole: InspectorRole;
  date: string;
  items: InspectionItem[];
  overallStatus: InspectionStatus;
  photos: string[];
  notes?: string;
  autoSuspended: boolean;
  createdAt: string;
}

export interface RepairMaterial {
  name: string;
  quantity: number;
  unit: string;
}

export interface Repair {
  id: string;
  classroomId: string;
  classroomName?: string;
  inspectionId?: string;
  status: RepairStatus;
  workerName: string;
  materials: RepairMaterial[];
  closeStartTime?: string;
  closeEndTime?: string;
  recheckResult?: RecheckResult;
  recheckDate?: string;
  recheckNotes?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  pendingInspections: number;
  suspendedClassrooms: number;
  repeatedHazards: number;
  affectedCourses: number;
  floorLifeWarnings: number;
}

export const INSPECTION_ITEM_LABELS: Record<InspectionItemType, string> = {
  edge_lifting: '翘边',
  bubbling: '起泡',
  cracking: '裂纹',
  water_accumulation: '积水',
  glue_stain: '胶痕',
  mirror_surface: '镜面',
  handrail: '把杆',
  hvac: '空调温湿度',
};

export const INSPECTION_ITEM_ICONS: Record<InspectionItemType, string> = {
  edge_lifting: 'CornerUpLeft',
  bubbling: 'CircleDot',
  cracking: 'GitBranch',
  water_accumulation: 'Droplets',
  glue_stain: 'StickyNote',
  mirror_surface: 'Sparkles',
  handrail: 'RailSymbol',
  hvac: 'Thermometer',
};

export const STATUS_LABELS: Record<InspectionStatus, string> = {
  normal: '正常',
  warning: '预警',
  critical: '严重',
};

export const CLASSROOM_STATUS_LABELS: Record<ClassroomStatus, string> = {
  normal: '正常使用',
  suspended: '暂停预约',
  maintenance: '维修中',
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: '待维修',
  in_progress: '维修中',
  completed: '已完成',
  recheck_failed: '复查未通过',
};
