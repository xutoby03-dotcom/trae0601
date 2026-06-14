export type LocationType = 'hall' | 'elevator';

export type PointStatus = 'active' | 'inactive';

export interface Point {
  id: string;
  building: string;
  location: LocationType;
  name: string;
  matSize: string;
  cleaner: string;
  photo: string;
  status: PointStatus;
  createdAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'recovered';

export interface RainTask {
  id: string;
  date: string;
  status: TaskStatus;
  weather: string;
  createdAt: string;
}

export type MatStatus = 'good' | 'curled' | 'wet' | 'dirty';

export type LayingStatus = 'pending' | 'laid' | 'checked';

export interface LayingRecord {
  id: string;
  taskId: string;
  pointId: string;
  layTime: string;
  layer: string;
  matStatus: MatStatus;
  hasWarningSign: boolean;
  photo: string;
  status: LayingStatus;
}

export type IssueType = 'curled' | 'water' | 'dirty';

export type IssueStatus = 'pending' | 'processing' | 'resolved';

export interface Issue {
  id: string;
  taskId: string;
  pointId: string;
  type: IssueType;
  description: string;
  photo: string;
  status: IssueStatus;
  handler?: string;
  handleTime?: string;
  handleResult?: string;
  createdAt: string;
}

export type DryStatus = 'pending' | 'drying' | 'dry' | 'stored';

export type RecoveryStatus = 'pending' | 'recovered';

export interface RecoveryRecord {
  id: string;
  taskId: string;
  pointId: string;
  recoverTime: string;
  recoverer: string;
  dryStatus: DryStatus;
  status: RecoveryStatus;
  createdAt: string;
}

export interface Statistics {
  totalPoints: number;
  todayLaid: number;
  pendingIssues: number;
  unrecovered: number;
  completionRate: number;
  avgResponseTime: number;
  waterHotSpots: { pointId: string; pointName: string; count: number }[];
  pointCompletion: { pointId: string; pointName: string; rate: number }[];
}
