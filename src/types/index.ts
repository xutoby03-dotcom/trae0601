export type DeviceType = '干粉灭火器' | '二氧化碳灭火器' | '泡沫灭火器' | '水基灭火器';

export interface Device {
  id: string;
  code: string;
  building: string;
  floor: string;
  location: string;
  type: DeviceType;
  minPressure: number;
  maxPressure: number;
  expireDate: string;
  photo: string;
  status: 'normal' | 'warning' | 'danger';
  createdAt: string;
}

export type PressureStatus = 'normal' | 'low' | 'high';
export type InspectionResult = 'normal' | 'abnormal';

export interface Inspection {
  id: string;
  deviceId: string;
  inspectDate: string;
  inspector: string;
  pressure: number;
  pressureStatus: PressureStatus;
  seal: boolean;
  hose: boolean;
  boxDoor: boolean;
  obstruction: boolean;
  result: InspectionResult;
  remark: string;
}

export type RectificationType = 'pressure' | 'expired' | 'obstruction' | 'other';
export type RectificationStatus = 'pending' | 'processing' | 'closed';

export interface Rectification {
  id: string;
  deviceId: string;
  inspectionId: string;
  type: RectificationType;
  description: string;
  status: RectificationStatus;
  createDate: string;
  deadline: string;
  handler: string;
  fixPhoto?: string;
  fixDate?: string;
  fixRemark?: string;
}

export interface BuildingStat {
  building: string;
  total: number;
  inspected: number;
  passRate: number;
}

export interface AnomalyPoint {
  deviceId: string;
  deviceCode: string;
  location: string;
  anomalyCount: number;
  lastAnomalyDate: string;
}

export interface DashboardStats {
  totalDevices: number;
  passRate: number;
  expiringSoon: number;
  pendingRectifications: number;
  buildingStats: BuildingStat[];
  repeatAnomalies: AnomalyPoint[];
  uncheckedThisMonth: Device[];
}
