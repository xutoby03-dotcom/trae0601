export type DeviceType = '灭火器' | '应急灯' | '安全出口贴纸';

export type LightingStatus = '正常' | '不亮' | '闪烁';

export type InspectionStatus = 'normal' | 'anomaly';

export type AnomalyStatus = 'pending' | 'reported' | 'reviewed';

export interface Point {
  id: string;
  area: string;
  deviceType: DeviceType;
  deviceNo: string;
  personInCharge: string;
  inspectionCycle: number;
  photo?: string;
  lastInspectionDate?: string;
  nextInspectionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionRecord {
  id: string;
  pointId: string;
  status: InspectionStatus;
  pressure?: number;
  lightingStatus?: LightingStatus;
  anomalyDescription?: string;
  photo?: string;
  inspector: string;
  inspectionTime: string;
  createdAt: string;
}

export interface AnomalyTicket {
  id: string;
  inspectionRecordId: string;
  pointId: string;
  status: AnomalyStatus;
  description: string;
  reporter: string;
  repairer?: string;
  reviewer?: string;
  reportTime: string;
  repairTime?: string;
  reviewTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatisticsData {
  floorPassRate: { floor: string; passRate: number; total: number; passed: number }[];
  anomalyByType: { type: string; count: number }[];
  openTicketsThisMonth: AnomalyTicket[];
  overduePoints: Point[];
}

export interface PointFormValues {
  area: string;
  deviceType: DeviceType;
  deviceNo: string;
  personInCharge: string;
  inspectionCycle: number;
  photo?: string;
  nextInspectionDate: string;
}

export interface InspectionFormValues {
  pointId: string;
  status: InspectionStatus;
  pressure?: number;
  lightingStatus?: LightingStatus;
  anomalyDescription?: string;
  photo?: string;
  inspector: string;
}
