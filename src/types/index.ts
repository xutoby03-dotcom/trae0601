export interface IceRink {
  id: string;
  name: string;
  width: number;
  height: number;
  doors: Door[];
}

export interface Door {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  side: 'top' | 'bottom' | 'left' | 'right';
}

export interface TrackPoint {
  timestamp: number;
  x: number;
  y: number;
  bladeHeight: number;
  water: boolean;
}

export interface MaintenanceSession {
  id: string;
  startTime: number;
  endTime?: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  bladeHeight: number;
  waterAmount: number;
  trackPoints: TrackPoint[];
  coveredArea: number;
}

export type IssueType = 'groove' | 'water' | 'ice_debris' | 'closed_area';
export type Severity = 'low' | 'medium' | 'high';

export interface IssueMarker {
  id: string;
  type: IssueType;
  x: number;
  y: number;
  severity: Severity;
  description: string;
  createdAt: number;
  resolved: boolean;
  resolvedAt?: number;
  radius?: number;
}

export type CourseType = 'training' | 'public' | 'private' | 'event';

export interface CourseSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: CourseType;
  name: string;
  team?: string;
}

export interface CourseSchedule {
  date: string;
  slots: CourseSlot[];
}

export type WindowType = 'recommended' | 'available' | 'short';

export interface MaintenanceWindow {
  startTime: string;
  endTime: string;
  duration: number;
  type: WindowType;
  reason?: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'evening';

export interface ShiftReport {
  id: string;
  shift: ShiftType;
  date: string;
  operatorName: string;
  iceConditionScore: number;
  issues: IssueMarker[];
  maintenanceCount: number;
  notes: string;
  nextShiftNotes: string;
  createdAt: number;
}

export type ViewMode = 'normal' | 'blade' | 'water' | 'coverage';
export type ActiveTool = 'none' | 'groove' | 'water' | 'ice_debris' | 'closed_area';
