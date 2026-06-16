export type BracesStage = '第一阶段' | '第二阶段' | '保持器';

export interface Braces {
  id: string;
  name: string;
  stage: BracesStage;
  doctor: string;
  receiveDate: string;
  boxColor: string;
  cleanCycle: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export type OdorLevel = 0 | 1 | 2 | 3;

export interface DailyRecord {
  id: string;
  bracesId: string;
  recordDate: string;
  wearHours: number;
  isBrushed: boolean;
  isSoaked: boolean;
  tookBoxOut: boolean;
  boxReturned: boolean;
  odorLevel: OdorLevel;
  hasPain?: boolean;
  painLocation?: string;
  hasCrack?: boolean;
  isLoose?: boolean;
  notes?: string;
  createdAt: string;
}

export type ReminderType = 'missed_wear' | 'overdue_clean' | 'lost_box' | 'low_stock';

export interface Reminder {
  id: string;
  bracesId: string;
  recordId?: string;
  type: ReminderType;
  title: string;
  description: string;
  triggerDate: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface Inventory {
  id: string;
  bracesId: string;
  currentStock: number;
  lowStockThreshold: number;
  lastRestockDate: string;
}

export interface CheckupNote {
  id: string;
  bracesId: string;
  checkupDate: string;
  hasPain: boolean;
  painLocation?: string;
  hasCrack: boolean;
  isLoose: boolean;
  recentMissedRecords: string;
  notes?: string;
  createdAt: string;
}

export interface AppState {
  braces: Braces[];
  records: DailyRecord[];
  reminders: Reminder[];
  inventories: Inventory[];
  checkupNotes: CheckupNote[];
}

export interface Statistics {
  weeklyQualifiedDays: number;
  consecutiveDays: number;
  estimatedDaysLeft: number;
  totalRecords: number;
  thisWeekRecords: DailyRecord[];
}

export type ReminderFilter = 'all' | ReminderType;
