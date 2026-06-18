export type EquipmentType =
  | 'mask'
  | 'snorkel'
  | 'fins'
  | 'rashGuard'
  | 'lifeJacket'
  | 'dryBag'
  | 'actionCam';

export type SwimLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export type EquipmentStatus = 'good' | 'damaged' | 'maintenance' | 'lost';

export interface Member {
  id: string;
  name: string;
  height: number;
  footSize: number;
  isMyopia: boolean;
  myopiaDegree?: number;
  swimLevel: SwimLevel;
  allergies: string;
  emergencyContact: string;
  avatar?: string;
}

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  size: string;
  owner: string;
  status: EquipmentStatus;
  photo?: string;
  batteryLevel?: number;
  hasPrescriptionLens?: boolean;
  notes?: string;
}

export interface Allocation {
  id: string;
  memberId: string;
  equipmentId: string;
}

export interface Luggage {
  id: string;
  name: string;
  color: string;
}

export interface PackingItem {
  id: string;
  luggageId: string;
  equipmentId: string;
  packed: boolean;
}

export interface ReturnCheck {
  id: string;
  equipmentId: string;
  waterIntrusion: boolean;
  scratches: boolean;
  lost: boolean;
  cleanedBy?: string;
  notes?: string;
}

export interface WarningItem {
  type: 'myopia' | 'finsSize' | 'lifeJacket' | 'battery';
  severity: 'warning' | 'error';
  message: string;
  memberId?: string;
  equipmentId?: string;
}

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  mask: '面镜',
  snorkel: '呼吸管',
  fins: '脚蹼',
  rashGuard: '防晒衣',
  lifeJacket: '救生衣',
  dryBag: '防水袋',
  actionCam: '运动相机',
};

export const SWIM_LEVEL_LABELS: Record<SwimLevel, string> = {
  beginner: '初学者',
  intermediate: '中级',
  advanced: '高级',
  professional: '专业',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  good: '良好',
  damaged: '损坏',
  maintenance: '维修中',
  lost: '丢失',
};
