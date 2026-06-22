export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type SeaState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type AlertLevel = 'info' | 'warning' | 'critical';

export type AlertType = 'interval_abnormal' | 'power_switch' | 'condensation' | 'maintenance';

export type ProcessStatus = 'pending' | 'processing' | 'resolved';

export type VesselFeedback = 'positive' | 'negative' | 'none';

export interface DutyRecord {
  id: string;
  timestamp: number;
  visibility: number;
  windDirection: WindDirection;
  windSpeed: number;
  seaState: SeaState;
  humidity: number;
  lightPeriod: number;
  lightPeriodNormal: boolean;
  fogInterval: number;
  fogIntervalNormal: boolean;
  vesselFeedback: VesselFeedback;
  vesselCount: number;
  remarks?: string;
}

export interface AlertEvent {
  id: string;
  timestamp: number;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  status: ProcessStatus;
  relatedRecordId?: string;
  handler?: string;
  resolvedAt?: number;
  resolution?: string;
}

export interface MaintenanceOrder {
  id: string;
  createdAt: number;
  equipment: string;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed';
  description?: string;
}

export interface ShiftSummary {
  recordCount: number;
  alertCount: number;
  criticalAlertCount: number;
  unresolvedAlertCount: number;
  maintenanceOrderCount: number;
  avgVisibility: number;
  minVisibility: number;
}

export interface DutyFormData {
  visibility: number;
  windDirection: WindDirection;
  windSpeed: number;
  seaState: SeaState;
  humidity: number;
  lightPeriod: number;
  fogInterval: number;
  vesselFeedback: VesselFeedback;
  vesselCount: number;
  remarks: string;
}
