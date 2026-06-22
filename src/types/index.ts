export interface Checkpoint {
  id: string;
  pointNumber: string;
  terrainDescription: string;
  hideMethod: string;
  estimatedArrival: string;
  batteryLevel: number;
  hasBackup: boolean;
  orderIndex: number;
  difficulty: number;
  distanceToNext: number;
  notes?: string;
}

export type InspectionCategory = 'location' | 'device' | 'backup' | 'safety';

export interface InspectionItem {
  id: string;
  description: string;
  category: InspectionCategory;
  isChecked: boolean;
  checkpointId?: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'extreme';

export interface RouteInfo {
  totalDistance: number;
  difficultyLevel: DifficultyLevel;
  averageDistance: number;
  withdrawalOrder: string[];
  maxDifficulty: number;
}

export interface FormState {
  pointNumber: string;
  terrainDescription: string;
  hideMethod: string;
  estimatedArrival: string;
  batteryLevel: number;
  hasBackup: boolean;
  difficulty: number;
  distanceToNext: number;
  notes: string;
}

export const HIDE_METHODS = [
  '树干背面',
  '岩石缝隙',
  '灌木丛中',
  '土堆后面',
  '桥墩下方',
  '标志牌后',
  '树根处',
  '草丛中',
  '岩石下',
  '其他',
] as const;

export const TERRAIN_TYPES = [
  '山地林区',
  '丘陵地带',
  '平原草地',
  '河流水系',
  '居民点旁',
  '公路沿线',
  '山顶开阔地',
  '山谷溪涧',
  '梯田区域',
  '杂木林地',
] as const;

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '极易',
  2: '较易',
  3: '中等',
  4: '较难',
  5: '极难',
};

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-400',
  2: 'bg-lime-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
};

export const CATEGORY_LABELS: Record<InspectionCategory, string> = {
  location: '点位位置',
  device: '打卡设备',
  backup: '备用标识',
  safety: '安全检查',
};

export const CATEGORY_COLORS: Record<InspectionCategory, string> = {
  location: 'bg-forest-100 text-forest-700',
  device: 'bg-blue-100 text-blue-700',
  backup: 'bg-terrain-100 text-terrain-700',
  safety: 'bg-alert-orange/10 text-alert-orange',
};
