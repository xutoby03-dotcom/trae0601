export type CheckInSource = 'elderly_phone' | 'family_report' | 'smart_device' | 'home_visit';

export type CheckInStatus = 'confirmed' | 'pending' | 'exception';

export type ExceptionStatus = 'pending' | 'processing' | 'escalated' | 'resolved';

export type ExceptionType = 'timeout' | 'abnormal';

export type PreferredMethod = 'phone' | 'family' | 'device' | 'visit';

export interface Elderly {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  building: string;
  unit: string;
  roomNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  chronicDiseases: string;
  preferredCheckMethod: PreferredMethod;
  visitFrequencyDays: number;
  gridId: string;
  avatar: string;
  notes: string;
}

export interface DailyCheckIn {
  id: string;
  elderlyId: string;
  checkDate: string;
  source: CheckInSource;
  status: CheckInStatus;
  checkTime: string;
  operatorId: string;
  notes: string;
}

export interface ExceptionRecord {
  id: string;
  elderlyId: string;
  exceptionDate: string;
  type: ExceptionType;
  status: ExceptionStatus;
  firstReminderTime: string | null;
  escalationTime: string | null;
  knockResult: string | null;
  contactedFamily: boolean | null;
  needMedical: boolean | null;
  handlingNotes: string;
  resolvedTime: string | null;
  resolverId: string | null;
}

export interface Grid {
  id: string;
  name: string;
  managerName: string;
  managerPhone: string;
}

export interface WeeklyReport {
  gridId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalElderly: number;
  unreportedCount: number;
  continuousExceptionCount: number;
  avgHandlingTime: number;
  focusList: string[];
}

export interface SourceConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface DashboardStats {
  totalToday: number;
  confirmed: number;
  unconfirmed: number;
  exceptions: number;
}
