export interface Room {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export type CurtainType = 'cloth' | 'sheer' | 'blackout' | 'roller' | 'bamboo';
export type WashMethod = 'machine' | 'hand' | 'dryclean' | 'spot';
export type DryingMethod = 'natural' | 'machine' | 'shade';
export type PhotoType = 'before' | 'after' | 'damage';
export type ReminderType = 'overdue' | 'mold' | 'track' | 'missing';
export type ReminderPriority = 'high' | 'medium' | 'low';
export type WashingStep = 'idle' | 'removal' | 'wash' | 'dry' | 'install' | 'complete';

export interface CurtainSize {
  width: number;
  height: number;
}

export interface Curtain {
  id: string;
  roomId: string;
  name: string;
  type: CurtainType;
  size: CurtainSize;
  hookCount: number;
  washMethod: WashMethod;
  lastWashDate: string | null;
  washCycleDays: number;
  notes: string;
  hasMold: boolean;
  trackStuck: boolean;
}

export interface RemovalCheck {
  trackIntact: boolean;
  strapIntact: boolean;
  hookIntact: boolean;
  clothIntact: boolean;
  notes: string;
}

export interface MissingPart {
  id: string;
  name: string;
  quantity: number;
  notes: string;
}

export interface WashingRecord {
  id: string;
  curtainId: string;
  startDate: string;
  removalTime: string | null;
  washTime: string | null;
  dryTime: string | null;
  installTime: string | null;
  removalCheck: RemovalCheck;
  dryingMethod: DryingMethod;
  ironed: boolean;
  missingParts: MissingPart[];
  totalMinutes: number;
  completed: boolean;
  currentStep: WashingStep;
}

export interface Photo {
  id: string;
  curtainId: string;
  dataUrl: string;
  createdAt: string;
  type: PhotoType;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  curtainId: string;
  roomId: string;
  message: string;
  date: string;
  priority: ReminderPriority;
}

export interface Statistics {
  roomsToWash: number;
  missingPartsTotal: number;
  monthlyWashCount: number;
  averageWashTime: number;
  totalCurtains: number;
  completedWashes: number;
}

export interface AppState {
  rooms: Room[];
  curtains: Curtain[];
  records: WashingRecord[];
  photos: Photo[];
  reminders: Reminder[];
}
