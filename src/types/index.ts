export type SkiLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ColdTolerance = 'low' | 'medium' | 'high';

export interface Member {
  id: string;
  name: string;
  height: number;
  weight: number;
  shoeSize: number;
  skiLevel: SkiLevel;
  hasMyopia: boolean;
  coldTolerance: ColdTolerance;
  avatar?: string;
  note?: string;
}

export type EquipmentType = 'snowboard' | 'shoes' | 'helmet' | 'goggles' | 'gloves' | 'protector';
export type EquipmentStatus = 'good' | 'worn' | 'damaged';

export interface Equipment {
  id: string;
  type: EquipmentType;
  size: string;
  name?: string;
  ownerId: string;
  status: EquipmentStatus;
  photo?: string;
  assignedTo?: string;
  carId?: string;
  hasMyopiaLens?: boolean;
}

export interface Car {
  id: string;
  plateNumber: string;
  driver: string;
  capacity: number;
}

export interface ReturnRecord {
  equipmentId: string;
  isWet: boolean;
  isDamaged: boolean;
  isLost: boolean;
  driedBy?: string;
  note?: string;
}

export type WarningType =
  | 'shoe_size_mismatch'
  | 'board_length_unsuitable'
  | 'myopia_without_lens'
  | 'critical_gear_missing';

export interface AssignmentWarning {
  type: WarningType;
  memberId: string;
  equipmentId?: string;
  message: string;
  severity: 'warning' | 'error';
}

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  snowboard: '雪板',
  shoes: '雪鞋',
  helmet: '头盔',
  goggles: '护目镜',
  gloves: '手套',
  protector: '护具',
};

export const SKI_LEVEL_LABELS: Record<SkiLevel, string> = {
  beginner: '初学者',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};

export const COLD_TOLERANCE_LABELS: Record<ColdTolerance, string> = {
  low: '怕冷',
  medium: '一般',
  high: '耐寒',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  good: '良好',
  worn: '有磨损',
  damaged: '损坏',
};
