export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  whiteboardCount: number;
  defaultColors: string[];
  minStock: number;
  managerName: string;
  managerPhone: string;
  photo: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColorStock {
  color: string;
  colorName: string;
  count: number;
  belowMin: boolean;
  consecutiveShortage: number;
}

export interface InspectionRecord {
  id: string;
  roomId: string;
  roomName: string;
  inspector: string;
  inspectionDate: string;
  colorStocks: ColorStock[];
  eraserCount: number;
  eraserBelowMin: boolean;
  sprayCount: number;
  sprayBelowMin: boolean;
  magnetCount: number;
  magnetBelowMin: boolean;
  needReplenish: boolean;
  notes: string;
  bookingDepartment: string;
  createdAt: string;
}

export interface SupplyItem {
  id: string;
  roomId: string;
  roomName: string;
  itemType: 'marker' | 'eraser' | 'spray' | 'magnet';
  color?: string;
  colorName?: string;
  requiredQuantity: number;
  consecutiveShortage: number;
  status: 'pending' | 'ordered' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface PurchaseSuggestion {
  itemType: 'marker' | 'eraser' | 'spray' | 'magnet';
  color?: string;
  colorName?: string;
  totalRequired: number;
  bufferStock: number;
  suggestedPurchase: number;
  roomsNeeding: string[];
}

export interface DepartmentStat {
  department: string;
  bookingCount: number;
  shortageCount: number;
  shortageRate: number;
  mostMissingItem: string;
}

export interface ConsumptionStat {
  roomId: string;
  roomName: string;
  totalInspections: number;
  totalShortages: number;
  shortageRate: number;
  averageConsumptionPerWeek: number;
}

export const COLOR_OPTIONS = [
  { color: 'black', colorName: '黑色', hex: '#1f2937' },
  { color: 'blue', colorName: '蓝色', hex: '#2563eb' },
  { color: 'red', colorName: '红色', hex: '#dc2626' },
  { color: 'green', colorName: '绿色', hex: '#16a34a' },
  { color: 'purple', colorName: '紫色', hex: '#9333ea' },
  { color: 'orange', colorName: '橙色', hex: '#ea580c' },
];

export const DEPARTMENTS = [
  '研发部',
  '产品部',
  '设计部',
  '市场部',
  '销售部',
  '人力资源部',
  '财务部',
  '运营部',
  '行政部',
];

export const INSPECTORS = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '孙七',
];
