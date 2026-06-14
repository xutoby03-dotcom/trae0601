export type ClothingType = 'top' | 'pants' | 'underwear' | 'bedding' | 'other';
export type RecordStatus = 'drying' | 'collected';
export type ReminderType = 'weather' | 'timeout' | 'night';
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'night';

export interface ClothesRecord {
  id: string;
  clothingType: ClothingType;
  clothingTypeLabel: string;
  clothingTypeIcon: string;
  quantity: number;
  location: string;
  locationId: string;
  responsiblePerson: string;
  responsiblePersonId: string;
  responsiblePersonAvatar: string;
  startTime: string;
  expectedDuration: number;
  isThick: boolean;
  photoUrl?: string;
  status: RecordStatus;
  collectedAt?: string;
  isDry?: boolean;
  isDamp?: boolean;
  needsRedry?: boolean;
  notes?: string;
  remindCount: number;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  gradientStart: string;
  gradientEnd: string;
  icon: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  recordId?: string;
  triggeredAt: string;
  message: string;
  isRead: boolean;
}

export interface WeatherInfo {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  forecast: string;
  icon: string;
}

export interface StatsData {
  weeklyDampCount: number;
  monthlyDampCount: number;
  forgottenByPerson: { personId: string; personName: string; personAvatar: string; count: number }[];
  thickClothesPending: ClothesRecord[];
  areaDampDistribution: { areaId: string; areaName: string; count: number }[];
  weeklyTrend: { date: string; dampCount: number; dryCount: number }[];
}

export interface ClothingTypeOption {
  value: ClothingType;
  label: string;
  icon: string;
}

export interface CollectFormData {
  isDry: boolean;
  isDamp: boolean;
  needsRedry: boolean;
  notes: string;
}
