export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ExceptionStatus = 'pending' | 'assigned' | 'processing' | 'resolved';

export type AssigneeType = 'maintenance' | 'security';

export interface PatrolPoint {
  id: string;
  routeId: string;
  name: string;
  riskLevel: RiskLevel;
  suggestedTime: string;
  photoUrl: string;
  orderIndex: number;
}

export interface PatrolRoute {
  id: string;
  name: string;
  description: string;
  points: PatrolPoint[];
  createdAt: string;
}

export interface PatrolRecord {
  id: string;
  routeId: string;
  patrolOfficerId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed';
}

export interface CheckInRecord {
  id: string;
  patrolRecordId: string;
  pointId: string;
  arrivalTime?: string;
  isAbnormal: boolean;
  abnormalDescription?: string;
  handlingResult?: string;
  photoUrl?: string;
  isMissed: boolean;
}

export interface ExceptionEvent {
  id: string;
  checkInRecordId: string;
  pointId: string;
  pointName: string;
  routeName: string;
  description: string;
  assigneeType?: AssigneeType;
  assigneeId?: string;
  assigneeName?: string;
  status: ExceptionStatus;
  createdAt: string;
  resolvedAt?: string;
  handlingResult?: string;
}

export interface PatrolOfficer {
  id: string;
  name: string;
  avatar?: string;
  role: 'officer' | 'maintenance' | 'security' | 'admin';
}
