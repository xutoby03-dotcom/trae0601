export type SportType =
  | 'running'
  | 'badminton'
  | 'yoga'
  | 'swimming'
  | 'cycling'
  | 'basketball'
  | 'football'
  | 'tennis'
  | 'fitness'
  | 'other';

export type EquipmentStatus = 'excellent' | 'good' | 'attention' | 'overdue' | 'retired';

export type IntensityLevel = 'low' | 'medium' | 'high';

export type MaintenanceAction = 'clean' | 'restring' | 'inflate' | 'replace' | 'retire' | 'check';

export interface Equipment {
  id: string;
  name: string;
  sportType: SportType;
  purchaseDate: string;
  lifespanDays: number;
  lifespanKm: number | null;
  maintenanceCycleDays: number;
  maintenanceCycleKm: number | null;
  lastMaintenanceDate: string | null;
  status: EquipmentStatus;
  photoUrl: string | null;
  createdAt: string;
  notes: string;
}

export interface UsageRecord {
  id: string;
  equipmentId: string;
  date: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  location: string;
  distanceKm: number | null;
  wearNotes: string;
  maintenanceCost: number;
}

export interface MaintenanceStatus {
  equipmentId: string;
  daysSinceLastMaintenance: number;
  daysUntilNextMaintenance: number;
  kmSinceLastMaintenance: number;
  kmUntilNextMaintenance: number | null;
  daysSincePurchase: number;
  totalKm: number;
  lifespanDaysRemaining: number;
  lifespanKmRemaining: number | null;
  isMaintenanceOverdue: boolean;
  isMaintenanceUpcoming: boolean;
  isLifespanOverdue: boolean;
  isLifespanUpcoming: boolean;
  suggestedAction: MaintenanceAction;
  totalUsageCount: number;
  totalCost: number;
  totalMinutes: number;
}

export interface MonthlyStats {
  month: string;
  usageCount: number;
  totalMinutes: number;
  totalCost: number;
  totalKm: number;
}

export interface EquipmentReplacementSuggestion {
  equipment: Equipment;
  maintenanceStatus: MaintenanceStatus;
  urgencyScore: number;
  reason: string;
}

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  running: '跑步',
  badminton: '羽毛球',
  yoga: '瑜伽',
  swimming: '游泳',
  cycling: '骑行',
  basketball: '篮球',
  football: '足球',
  tennis: '网球',
  fitness: '健身',
  other: '其他',
};

export const SPORT_TYPE_ICONS: Record<SportType, string> = {
  running: 'Footprints',
  badminton: 'Bird',
  yoga: 'PersonStanding',
  swimming: 'Waves',
  cycling: 'Bike',
  basketball: 'Dribbble',
  football: 'CircleDot',
  tennis: 'Target',
  fitness: 'Dumbbell',
  other: 'Package',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  excellent: '状态极佳',
  good: '状态良好',
  attention: '需要注意',
  overdue: '已超期',
  retired: '已退役',
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  excellent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  good: 'bg-sky-100 text-sky-700 border-sky-200',
  attention: 'bg-amber-100 text-amber-700 border-amber-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
  retired: 'bg-warm-200 text-warm-600 border-warm-300',
};

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  low: '低强度',
  medium: '中等强度',
  high: '高强度',
};

export const INTENSITY_COLORS: Record<IntensityLevel, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export const MAINTENANCE_ACTION_LABELS: Record<MaintenanceAction, string> = {
  clean: '清洗',
  restring: '更换球线',
  inflate: '补气',
  replace: '更换',
  retire: '考虑退役',
  check: '检查',
};

export const MAINTENANCE_ACTION_ICONS: Record<MaintenanceAction, string> = {
  clean: 'Sparkles',
  restring: 'RefreshCw',
  inflate: 'Wind',
  replace: 'ShoppingBag',
  retire: 'Archive',
  check: 'AlertCircle',
};
