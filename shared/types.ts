export type ShadeCondition = 'full_sun' | 'partial_shade' | 'full_shade';
export type CropStatus = 'seedling' | 'growing' | 'mature' | 'harvesting' | 'ready_to_harvest' | 'needs_attention' | 'dormant';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type ScheduleStatus = 'unclaimed' | 'claimed' | 'completed' | 'skipped';
export type WeedLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type Pests = 'none' | 'minor' | 'moderate' | 'severe';
export type Weeds = 'none' | 'minor' | 'moderate' | 'severe';
export type AnomalyType = 'duplicate_watering' | 'missed_watering' | 'pest_infestation' | 'excessive_weeds' | 'low_soil_moisture' | 'other';
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical' | 'info' | 'warning';
export type AnomalyStatus = 'pending' | 'resolved' | 'dismissed';
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'hot';
export type VolunteerRole = 'volunteer' | 'admin';

export interface Photo {
  id: string;
  gardenBedId: string;
  url: string;
  takenAt: string;
  description: string;
}

export interface GardenBed {
  id: string;
  bedNumber: string;
  growerName: string;
  crop: string;
  plantDate: string;
  wateringFrequency: number;
  shadeCondition: ShadeCondition;
  status: CropStatus;
  photoUrl?: string;
  photos?: Photo[];
  lastWateredAt?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  totalWaterings: number;
  joinDate: string;
  role: VolunteerRole;
  managedBedIds?: string[];
}

export interface Schedule {
  id: string;
  gardenBedId: string;
  volunteerId?: string;
  scheduledDate: string;
  timeSlot: TimeSlot;
  status: ScheduleStatus;
  notes?: string;
}

export interface CheckIn {
  id: string;
  gardenBedId: string;
  volunteerId: string;
  scheduleId?: string;
  checkInTime: string;
  createdAt: string;
  waterAmount: number;
  soilMoisture: number;
  hasPests: boolean;
  pestDetails?: string;
  hasWeeds: boolean;
  weedLevel?: WeedLevel;
  harvestedAmount: number;
  notes?: string;
  photoUrl?: string;
}

export interface Anomaly {
  id: string;
  checkInId?: string;
  gardenBedId?: string;
  detectedByVolunteerId?: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  description?: string;
  status?: AnomalyStatus;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface Weather {
  condition: WeatherCondition;
  temperature: number;
  consecutiveHotDays: number;
  humidity: number;
  forecast: string;
  shouldSkipWatering?: boolean;
  skipReason?: string;
  shouldIncreaseWatering?: boolean;
  increaseReason?: string;
  highHeatWarning?: boolean;
  wateringAdvice?: string[];
}

export interface DashboardStats {
  todaySchedules: {
    total: number;
    completed: number;
    inProgress: number;
    unclaimed: number;
  };
  anomaliesCount: number;
  waterUsageThisWeek: { date: string; amount: number }[];
  readyToHarvest: GardenBed[];
  cropGrowthStatus: { gardenBed: GardenBed; growthProgress: number }[];
}

export interface CropGrowthCycle {
  [key: string]: number;
}

export const CROP_GROWTH_CYCLES: CropGrowthCycle = {
  '番茄': 60,
  '西红柿': 60,
  '黄瓜': 45,
  '生菜': 30,
  '辣椒': 70,
  '茄子': 75,
  '白菜': 50,
  '萝卜': 40,
  '菠菜': 35,
  '芹菜': 65,
  '韭菜': 80,
  '豆角': 55,
  '豌豆': 60,
  '玉米': 90,
  '南瓜': 100,
  '西瓜': 90,
  '草莓': 120,
  '默认': 60,
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '早 (6:00-9:00)',
  afternoon: '午 (14:00-17:00)',
  evening: '晚 (18:00-21:00)',
};

export const SHADE_CONDITION_LABELS: Record<ShadeCondition, string> = {
  full_sun: '全日照',
  partial_shade: '半遮阴',
  full_shade: '全遮阴',
};

export const CROP_STATUS_LABELS: Record<CropStatus, string> = {
  seedling: '幼苗期 🌱',
  growing: '生长期 🌿',
  mature: '成熟期 🌳',
  harvesting: '可采收 🫐',
  ready_to_harvest: '可采摘 🍅',
  needs_attention: '需关注 ⚠️',
  dormant: '休眠期 💤',
};

export const ANOMALY_TYPE_LABELS: Record<AnomalyType, string> = {
  duplicate_watering: '重复浇水',
  missed_watering: '漏浇',
  pest_infestation: '病虫害',
  excessive_weeds: '杂草过多',
  low_soil_moisture: '土壤过干',
  other: '其他异常',
};

export const ANOMALY_SEVERITY_LABELS: Record<AnomalySeverity, string> = {
  info: '提示',
  warning: '警告',
  critical: '严重',
  low: '轻微',
  medium: '中等',
  high: '高',
};

export const ANOMALY_STATUS_LABELS: Record<AnomalyStatus, string> = {
  pending: '待处理',
  resolved: '已处理',
  dismissed: '已忽略',
};

export const WEED_LEVEL_LABELS: Record<WeedLevel, string> = {
  none: '无',
  mild: '少量',
  moderate: '中等',
  severe: '严重',
};

export const CROP_EMOJIS: Record<string, string> = {
  '番茄': '🍅',
  '西红柿': '🍅',
  '黄瓜': '🥒',
  '生菜': '🥬',
  '辣椒': '🌶️',
  '茄子': '🍆',
  '白菜': '🥗',
  '萝卜': '🥕',
  '菠菜': '🥬',
  '芹菜': '🥬',
  '韭菜': '🌿',
  '豆角': '🫛',
  '豌豆': '🫛',
  '玉米': '🌽',
  '南瓜': '🎃',
  '西瓜': '🍉',
  '草莓': '🍓',
};
