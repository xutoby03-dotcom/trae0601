export interface User {
  id: string;
  name: string;
  role: 'admin' | 'member';
  avatar?: string;
}

export type EquipmentType = 'camera' | 'lens' | 'flash' | 'stabilizer' | 'memory_card' | 'battery' | 'charger' | 'cable';

export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'damaged' | 'lost';

export interface Battery {
  id: string;
  model: string;
  equipmentId?: string;
  capacity: number;
  chargeLevel: number;
  lastChargedAt?: string;
  chargeCycles: number;
  brand?: string;
}

export interface MemoryCard {
  id: string;
  brand: string;
  model: string;
  capacity: string;
  totalCapacity: number;
  usedCapacity: number;
  equipmentId?: string;
  speed?: string;
}

export interface Equipment {
  id: string;
  type: EquipmentType;
  brand: string;
  model: string;
  ownerId: string;
  photo?: string;
  firmwareVersion?: string;
  purchaseDate?: string;
  status: EquipmentStatus;
  notes?: string;
  batteries: Battery[];
  memoryCards: MemoryCard[];
}

export type MissionStatus = 'draft' | 'packing' | 'shooting' | 'returning' | 'completed';

export interface MissionEquipment {
  id: string;
  equipmentId: string;
  assignedTo?: string;
}

export interface Mission {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  leaderId: string;
  status: MissionStatus;
  notes?: string;
  equipmentList: MissionEquipment[];
}

export interface MissionFormData {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  leaderId: string;
  status: MissionStatus;
  notes?: string;
  equipmentIds?: string[];
}

export interface PackCheck {
  id: string;
  missionId: string;
  checkedBy: string;
  checkedAt: string;
  batteryChecked: boolean;
  cardCapacityChecked: boolean;
  chargerReady: boolean;
  spareCableReady: boolean;
  firmwareChecked: boolean;
  notes?: string;
  issues: string[];
  createdAt: string;
}

export interface BatteryChange {
  id: string;
  equipmentId: string;
  oldBatteryId: string;
  newBatteryId: string;
  oldBatteryLevel: number;
  newBatteryLevel: number;
  timestamp: string;
  operatorId: string;
  location: string;
  notes?: string;
}

export interface CardFull {
  id: string;
  equipmentId: string;
  cardId: string;
  timestamp: string;
  operatorId: string;
  photosCount: number;
  videoMinutes?: number;
  notes?: string;
}

export interface ShootingRecordItem {
  id: string;
  missionId: string;
  batteryChanges: BatteryChange[];
  cardFulls: CardFull[];
  createdAt: string;
}

export type EquipmentCondition = 'good' | 'minor' | 'damaged';

export interface EquipmentCheck {
  equipmentId: string;
  returned: boolean;
  condition: EquipmentCondition;
  damage: boolean;
  missing: boolean;
  issues: string[];
  notes: string;
}

export interface ReturnCheck {
  id: string;
  missionId: string;
  checkedBy: string;
  checkedAt: string;
  equipmentChecks: EquipmentCheck[];
  notes?: string;
  hasDamage: boolean;
  hasMissing: boolean;
  createdAt: string;
}

export interface EquipmentKit {
  id: string;
  name: string;
  description: string;
  equipmentIds: string[];
}

export const equipmentTypeLabels: Record<EquipmentType, string> = {
  camera: '相机',
  lens: '镜头',
  flash: '闪光灯',
  stabilizer: '稳定器',
  memory_card: '存储卡',
  battery: '电池',
  charger: '充电器',
  cable: '数据线',
};

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  available: '可用',
  in_use: '使用中',
  maintenance: '维护中',
  damaged: '已损坏',
  lost: '已丢失',
};

export const missionStatusLabels: Record<MissionStatus, string> = {
  draft: '草稿',
  packing: '待出发',
  shooting: '拍摄中',
  returning: '归还中',
  completed: '已完成',
};

export const conditionLabels: Record<EquipmentCondition, string> = {
  good: '完好',
  minor: '轻微磨损',
  damaged: '损坏',
};
