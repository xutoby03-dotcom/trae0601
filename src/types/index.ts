export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Cat {
  id: string;
  name: string;
  avatar: string;
}

export type LitterType = '膨润土' | '豆腐砂' | '混合砂' | '水晶砂' | '松木砂' | '纸砂';

export interface LitterBox {
  id: string;
  name: string;
  location: string;
  litterType: LitterType;
  capacity: number;
  photo: string;
  lastFullChange: string;
  fullChangeIntervalDays: number;
  cleanIntervalHours: number;
  catIds: string[];
}

export type ClumpLevel = '少' | '中' | '多';

export interface CleanRecord {
  id: string;
  litterBoxId: string;
  memberId: string;
  cleanTime: string;
  smellLevel: 1 | 2 | 3 | 4 | 5;
  clumpLevel: ClumpLevel;
  addedLitter: boolean;
  addedAmount: number;
  note?: string;
  isFullChange: boolean;
}

export type AlertType = 'overdue_clean' | 'full_change_due' | 'high_smell_chain' | 'deep_clean_needed';

export interface Alert {
  id: string;
  type: AlertType;
  litterBoxId: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  createdAt: string;
}

export type BoxStatus = 'normal' | 'upcoming' | 'overdue' | 'full_change_due';

export interface BoxStatusInfo {
  boxId: string;
  status: BoxStatus;
  hoursSinceLastClean: number;
  lastCleanTime?: string;
  lastCleanMember?: string;
  daysSinceFullChange: number;
}

export interface MemberStats {
  memberId: string;
  totalCleans: number;
  totalFullChanges: number;
  averageSmellLevel: number;
}

export interface BoxStats {
  boxId: string;
  totalCleans: number;
  averageIntervalHours: number;
  averageSmellLevel: number;
  totalLitterAdded: number;
}

export interface ScheduleItem {
  time: string;
  memberId: string;
  litterBoxId: string;
  status: 'pending' | 'done';
}
