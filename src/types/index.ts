export type MaterialType = 'scentPaper' | 'coffeeBean' | 'sprayNozzle' | 'cleaningCloth' | 'labelSticker';

export const MATERIAL_CONFIG: Record<MaterialType, { name: string; unit: string; icon: string; color: string }> = {
  scentPaper: { name: '试香纸', unit: '张', icon: 'FileText', color: '#722F37' },
  coffeeBean: { name: '咖啡豆', unit: 'g', icon: 'Coffee', color: '#6F4E37' },
  sprayNozzle: { name: '一次性喷头', unit: '个', icon: 'SprayCan', color: '#4A6741' },
  cleaningCloth: { name: '清洁布', unit: '块', icon: 'Sparkles', color: '#2A52BE' },
  labelSticker: { name: '标签贴', unit: '张', icon: 'Tag', color: '#C9A962' },
};

export type PeriodType = 'morning' | 'noon' | 'closing';

export const PERIOD_CONFIG: Record<PeriodType, { name: string; time: string; icon: string }> = {
  morning: { name: '开店巡查', time: '09:00 - 09:30', icon: 'Sunrise' },
  noon: { name: '午间巡查', time: '13:00 - 13:30', icon: 'Sun' },
  closing: { name: '闭店巡查', time: '21:00 - 21:30', icon: 'Moon' },
};

export type TaskStatus = 'pending' | 'inProgress' | 'completed';
export type TaskUrgency = 'normal' | 'high' | 'urgent';

export const TASK_STATUS_CONFIG: Record<TaskStatus, { name: string; className: string }> = {
  pending: { name: '待处理', className: 'tag-status-warning' },
  inProgress: { name: '进行中', className: 'tag-gold' },
  completed: { name: '已完成', className: 'tag-status-normal' },
};

export const TASK_URGENCY_CONFIG: Record<TaskUrgency, { name: string; color: string }> = {
  normal: { name: '普通', color: '#4CAF50' },
  high: { name: '高', color: '#FF9800' },
  urgent: { name: '紧急', color: '#E53935' },
};

export type UserRole = 'guide' | 'manager' | 'admin';

export interface Guide {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  counterId: string;
  role: UserRole;
}

export interface Counter {
  id: string;
  name: string;
  brandColor: string;
  tastingTableCount: number;
  displayBottleCount: number;
  photoUrls: string[];
  description?: string;
  createdAt: string;
}

export interface CounterWithGuides extends Counter {
  guides: Guide[];
}

export interface InventoryItem {
  id: string;
  counterId: string;
  materialType: MaterialType;
  quantity: number;
  batchNo: string;
  drawer: string;
  threshold: number;
  lastUpdated: string;
}

export interface InspectionItem {
  materialType: MaterialType;
  quantity: number;
  threshold: number;
  isShortage: boolean;
}

export interface InspectionRecord {
  id: string;
  counterId: string;
  guideId: string;
  period: PeriodType;
  inspectedAt: string;
  items: InspectionItem[];
  isActivityDay: boolean;
  thresholdMultiplier?: number;
  generatedTaskCount?: number;
}

export interface OperationLog {
  action: string;
  operatorId: string;
  operatorName?: string;
  timestamp: string;
  note?: string;
}

export interface SupplyTask {
  id: string;
  counterId: string;
  inspectionRecordId: string;
  materialType: MaterialType;
  shortageQty: number;
  targetQty: number;
  status: TaskStatus;
  urgency: TaskUrgency;
  assigneeId?: string;
  remarks?: string;
  operationLogs: OperationLog[];
  createdAt: string;
  completedAt?: string;
}

export interface SupplyTaskWithDetails extends SupplyTask {
  counterName: string;
  assigneeName?: string;
  shortageDurationHours?: number;
}

export interface Activity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  thresholdMultiplier: number;
  counterIds: string[];
  description?: string;
}

export interface DashboardStats {
  pendingTasks: number;
  shortageAlerts: number;
  todayInspections: number;
  totalInspections: number;
  weekCompletedTasks: number;
  avgCompletionTime: number;
}

export interface ConsumptionData {
  date: string;
  counterId: string;
  counterName: string;
  materialType: MaterialType;
  consumed: number;
  isActivity: boolean;
}

export interface ShortageRecord {
  materialType: MaterialType;
  counterId: string;
  counterName: string;
  startedAt: string;
  resolvedAt?: string;
  durationHours: number;
}

export interface PurchaseSuggestion {
  materialType: MaterialType;
  currentStock: number;
  avgDailyConsumption: number;
  availableDays: number;
  suggestedQuantity: number;
  suggestedDate: string;
  reason: string;
}
