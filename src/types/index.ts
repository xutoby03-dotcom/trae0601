export type FilterMaterialType = '过滤棉' | '生化棉' | '陶瓷环' | '活性炭' | '除藻棉';

export type MaintenanceType = '换水' | '清洗过滤桶' | '添加硝化细菌';

export type WaterColor = '清澈' | '微黄' | '发绿' | '浑浊';

export interface Tank {
  id: string;
  name: string;
  capacity: number;
  filterModel: string;
  fishSpecies: string[];
  temperature: number;
  lightDuration: number;
  photo: string | null;
  createdAt: string;
}

export interface ReplaceRecord {
  id: string;
  date: string;
  note: string;
}

export interface FilterMaterial {
  id: string;
  tankId: string;
  type: FilterMaterialType;
  installDate: string;
  replaceCycleDays: number;
  cleaningMethod: string;
  stock: number;
  replaceHistory: ReplaceRecord[];
}

export interface MaintenanceLog {
  id: string;
  tankId: string;
  type: MaintenanceType;
  date: string;
  description: string;
  waterChangeAmount?: number;
  waterChangePercent?: number;
  nitrifyingBrand?: string;
  nitrifyingDosage?: string;
}

export interface WaterQuality {
  id: string;
  tankId: string;
  date: string;
  ammonia: number;
  nitrite: number;
  pH: number;
  waterColor: WaterColor;
  note: string;
}

export const FILTER_MATERIAL_DEFAULTS: Record<FilterMaterialType, { replaceCycleDays: number; cleaningMethod: string }> = {
  '过滤棉': { replaceCycleDays: 30, cleaningMethod: '水冲洗' },
  '生化棉': { replaceCycleDays: 90, cleaningMethod: '原缸水轻搓' },
  '陶瓷环': { replaceCycleDays: 180, cleaningMethod: '原缸水浸泡' },
  '活性炭': { replaceCycleDays: 30, cleaningMethod: '不可清洗直接更换' },
  '除藻棉': { replaceCycleDays: 60, cleaningMethod: '水冲洗' },
};

export const FILTER_MATERIAL_ICONS: Record<FilterMaterialType, string> = {
  '过滤棉': '🧽',
  '生化棉': '🫧',
  '陶瓷环': '🔗',
  '活性炭': '⚫',
  '除藻棉': '🌿',
};

export const WATER_CHANGE_CYCLE_DAYS = 7;
