export type RecoveryPointStatus = 'normal' | 'warning' | 'full' | 'exception';

export type SortingCategory = 'donatable' | 'recyclable' | 'damaged' | 'needs_cleaning';

export type ExceptionType = 'full' | 'moisture' | 'odor' | 'damage';

export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ExceptionStatus = 'pending' | 'handling' | 'resolved';

export interface RecoveryPoint {
  id: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  capacityKg: number;
  currentKg: number;
  collectionSchedule: string;
  photoUrl: string;
  status: RecoveryPointStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DropRecord {
  id: string;
  recoveryPointId: string;
  bagCount: number;
  clothingTypes: string[];
  isCleaned: boolean;
  hasShoesBagsToys: boolean;
  contributor: string;
  dropTime: string;
  status: 'pending' | 'sorting' | 'completed';
}

export interface SortingItem {
  id: string;
  category: SortingCategory;
  weightKg: number;
  destination: string;
  partnerOrg: string;
  problemPhotoUrl?: string;
  remark?: string;
}

export interface SortingRecord {
  id: string;
  recoveryPointId: string;
  dropRecordId: string;
  sorter: string;
  sortingTime: string;
  items: SortingItem[];
}

export interface Exception {
  id: string;
  recoveryPointId: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  description: string;
  photoUrl?: string;
  handler?: string;
  handledAt?: string;
  status: ExceptionStatus;
  createdAt: string;
}

export interface CollectionRecord {
  id: string;
  recoveryPointId: string;
  weightKg: number;
  collectionTime: string;
  collector: string;
  status: 'scheduled' | 'completed';
  createdAt: string;
}

export interface StatisticsData {
  totalRecoveryKg: number;
  donatableRatio: number;
  collectionCompletionRate: number;
  exceptionCount: number;
  monthlyDropVolume: { name: string; value: number }[];
  sortingRatio: { name: string; value: number; color: string }[];
  collectionEfficiency: { date: string; responseTime: number }[];
  donationDestinations: { source: string; target: string; value: number }[];
}
