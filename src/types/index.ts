export type EquipmentType = 'lifebuoy' | 'rescue_pole' | 'warning_sign' | 'first_aid_kit' | 'camera';

export type EquipmentStatus = 'normal' | 'abnormal' | 'maintaining';

export type TaskStatus = 'pending' | 'processing' | 'completed';

export type TaskType = 'repair' | 'replace';

export type InspectionStatus = 'pass' | 'fail';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  code: string;
  location: string;
  zone: string;
  purchaseDate: string;
  responsiblePerson: string;
  photo: string;
  status: EquipmentStatus;
  lastInspectionDate?: string;
  createdAt: string;
}

export interface InspectionItem {
  id: string;
  itemName: string;
  itemKey: string;
  itemValue: string;
  rawValue: string;
  isAbnormal: boolean;
  description?: string;
}

export interface Inspection {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  equipmentCode?: string;
  inspectionDate: string;
  inspector: string;
  status: InspectionStatus;
  remark?: string;
  items: InspectionItem[];
}

export interface TaskItemSource {
  itemKey: string;
  itemName: string;
  rawValue: string;
  itemValue: string;
  type: TaskType;
  reason: string;
  description?: string;
}

export interface Task {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  equipmentCode?: string;
  equipmentLocation?: string;
  inspectionId: string;
  type: TaskType;
  status: TaskStatus;
  assignee: string;
  description: string;
  abnormalItems: string[];
  abnormalItemSources: TaskItemSource[];
  decisionReason: string;
  createdAt: string;
  completedAt?: string;
  handleRecord?: string;
}

export interface LifebuoyCheck {
  agingCondition: 'good' | 'minor' | 'severe';
  ropeLength: number;
  ropeCondition: 'good' | 'damaged' | 'missing';
}

export interface RescuePoleCheck {
  crackCondition: 'none' | 'minor' | 'severe';
  lengthOk: boolean;
  hookCondition: 'good' | 'damaged' | 'missing';
}

export interface WarningSignCheck {
  clarity: 'clear' | 'faded' | 'unreadable';
  fixation: 'firm' | 'loose' | 'missing';
}

export interface FirstAidKitCheck {
  completeness: 'complete' | 'partial' | 'empty';
  expiryOk: boolean;
  sealCondition: 'good' | 'damaged';
}

export interface CameraCheck {
  viewBlocked: boolean;
  working: boolean;
  angleOk: boolean;
}

export const EquipmentTypeLabels: Record<EquipmentType, string> = {
  lifebuoy: '救生圈',
  rescue_pole: '救生杆',
  warning_sign: '警示牌',
  first_aid_kit: '急救箱',
  camera: '监控摄像头',
};

export const EquipmentStatusLabels: Record<EquipmentStatus, string> = {
  normal: '正常',
  abnormal: '异常',
  maintaining: '维护中',
};

export const TaskStatusLabels: Record<TaskStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
};

export const TaskTypeLabels: Record<TaskType, string> = {
  repair: '维修',
  replace: '补采',
};

export const InspectionStatusLabels: Record<InspectionStatus, string> = {
  pass: '合格',
  fail: '不合格',
};

export const PoolZones = [
  'A区-深水池',
  'B区-浅水池',
  'C区-儿童池',
  'D区-入口处',
  'E区-更衣区',
];
