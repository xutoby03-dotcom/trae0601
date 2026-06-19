export enum DeviceStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  PENDING_DISINFECTION = 'pending_dis',
  DISINFECTING = 'disinfecting',
  SCRAPPED = 'scrapped',
}

export const DeviceStatusLabel: Record<DeviceStatus, string> = {
  [DeviceStatus.AVAILABLE]: '可用',
  [DeviceStatus.IN_USE]: '使用中',
  [DeviceStatus.PENDING_DISINFECTION]: '待消毒',
  [DeviceStatus.DISINFECTING]: '消毒中',
  [DeviceStatus.SCRAPPED]: '已报废',
};

export const DeviceStatusColor: Record<DeviceStatus, string> = {
  [DeviceStatus.AVAILABLE]: 'bg-green-100 text-green-700 border-green-200',
  [DeviceStatus.IN_USE]: 'bg-blue-100 text-blue-700 border-blue-200',
  [DeviceStatus.PENDING_DISINFECTION]: 'bg-orange-100 text-orange-700 border-orange-200',
  [DeviceStatus.DISINFECTING]: 'bg-teal-100 text-teal-700 border-teal-200',
  [DeviceStatus.SCRAPPED]: 'bg-slate-100 text-slate-500 border-slate-200',
};

export enum MaskType {
  ADULT = 'adult',
  CHILD = 'child',
  INFANT = 'infant',
}

export const MaskTypeLabel: Record<MaskType, string> = {
  [MaskType.ADULT]: '成人面罩',
  [MaskType.CHILD]: '儿童面罩',
  [MaskType.INFANT]: '婴幼儿面罩',
};

export enum DisinfectionStepIndex {
  CLEANING = 1,
  SOAKING = 2,
  RINSING = 3,
  DRYING = 4,
  STORING = 5,
}

export const DisinfectionStepInfo: Record<DisinfectionStepIndex, { name: string; desc: string; duration: string }> = {
  [DisinfectionStepIndex.CLEANING]: { name: '清洗', desc: '用流动清水冲洗设备表面和管路，去除残留药液和分泌物', duration: '约5分钟' },
  [DisinfectionStepIndex.SOAKING]: { name: '浸泡消毒', desc: '将配件完全浸没于含氯消毒液(500mg/L)中≥30分钟', duration: '≥30分钟' },
  [DisinfectionStepIndex.RINSING]: { name: '无菌水冲洗', desc: '用无菌水/纯化水充分冲洗，去除残留消毒液', duration: '约3分钟' },
  [DisinfectionStepIndex.DRYING]: { name: '晾干', desc: '置于无菌干燥架上自然晾干，避免用布擦拭', duration: '约20分钟' },
  [DisinfectionStepIndex.STORING]: { name: '收纳', desc: '放入无菌储物袋/柜中，标注消毒日期和有效期', duration: '约2分钟' },
};

export enum DisinfectionTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export const DisinfectionTaskStatusLabel: Record<DisinfectionTaskStatus, string> = {
  [DisinfectionTaskStatus.PENDING]: '待消毒',
  [DisinfectionTaskStatus.IN_PROGRESS]: '消毒中',
  [DisinfectionTaskStatus.COMPLETED]: '已完成',
  [DisinfectionTaskStatus.OVERDUE]: '逾期未处理',
};

export enum UsageStatus {
  ONGOING = 'ongoing',
  FINISHED = 'finished',
}

export const UsageStatusLabel: Record<UsageStatus, string> = {
  [UsageStatus.ONGOING]: '进行中',
  [UsageStatus.FINISHED]: '已结束',
};

export enum ScrapReason {
  DAMAGED = 'damaged',
  YELLOWED = 'yellowed',
  AGED = 'aged',
  OTHER = 'other',
}

export const ScrapReasonLabel: Record<ScrapReason, string> = {
  [ScrapReason.DAMAGED]: '面罩破损',
  [ScrapReason.YELLOWED]: '管路发黄',
  [ScrapReason.AGED]: '老化失效',
  [ScrapReason.OTHER]: '其他原因',
};

export interface Device {
  id: string;
  code: string;
  brand: string;
  model: string;
  ageRange: string;
  accessories: string[];
  clinicRoom: string;
  photo: string;
  status: DeviceStatus;
  purchaseDate: string;
  lastMaintenanceDate?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: string;
  deviceId: string;
  deviceCode?: string;
  patientName: string;
  patientAge: number;
  doctor: string;
  medicine: string;
  medicineDose: number;
  maskType: MaskType;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  status: UsageStatus;
  remark?: string;
  createdAt: string;
}

export interface DisinfectionStep {
  stepIndex: DisinfectionStepIndex;
  stepName: string;
  operator: string;
  finishedAt?: string;
  note?: string;
}

export interface DisinfectionTask {
  id: string;
  usageId: string;
  deviceId: string;
  deviceCode?: string;
  currentStep: number;
  steps: DisinfectionStep[];
  status: DisinfectionTaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  lastStockInDate?: string;
  remark?: string;
}

export interface StockLog {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  operator: string;
  relatedId?: string;
  createdAt: string;
}

export interface ScrapRecord {
  id: string;
  itemId?: string;
  itemName: string;
  type: string;
  quantity: number;
  reason: ScrapReason;
  relatedDeviceId?: string;
  relatedDeviceCode?: string;
  operator: string;
  remark?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export const CLINIC_ROOMS = ['1号诊室', '2号诊室', '3号诊室', '4号诊室', '雾化室'];

export const ACCESSORY_OPTIONS = [
  '雾化杯',
  '成人面罩',
  '儿童面罩',
  '婴幼儿面罩',
  '送气管',
  '咬嘴',
  '转接管',
  '过滤棉',
];

export const OVERDUE_THRESHOLD_MINUTES = 120;

export interface DashboardStats {
  totalDevices: number;
  availableDevices: number;
  inUseDevices: number;
  pendingDisinfection: number;
  overdueTasks: number;
  todayUsageCount: number;
}

export interface ClinicRoomUsage {
  room: string;
  count: number;
}
