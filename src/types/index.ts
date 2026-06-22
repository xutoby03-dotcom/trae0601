export interface Equipment {
  id: string;
  turntableModel: string;
  tonearmModel: string;
  cartridgeModel: string;
  targetForceMin: number;
  targetForceMax: number;
  installDate: string;
  notes?: string;
  createdAt: string;
}

export interface Calibration {
  id: string;
  equipmentId: string;
  calibrationDate: string;
  targetForce: number;
  measuredForce: number;
  antiSkate: number;
  operator: string;
  notes?: string;
  createdAt: string;
}

export interface ListeningTest {
  id: string;
  calibrationId: string;
  equipmentId: string;
  testDate: string;
  jumpLevel: number;
  sibilanceLevel: number;
  leftChannelDb: number;
  rightChannelDb: number;
  recordName?: string;
  notes?: string;
  createdAt: string;
}

export type AlertType = 'realignment' | 'replace_stylus' | 'channel_balance';
export type AlertSeverity = 'warning' | 'danger';

export interface Alert {
  id: string;
  equipmentId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  relatedRecordId?: string;
}

export interface NewEquipment {
  turntableModel: string;
  tonearmModel: string;
  cartridgeModel: string;
  targetForceMin: number;
  targetForceMax: number;
  installDate: string;
  notes?: string;
}

export interface NewCalibration {
  equipmentId: string;
  calibrationDate: string;
  targetForce: number;
  measuredForce: number;
  antiSkate: number;
  operator: string;
  notes?: string;
}

export interface NewListeningTest {
  calibrationId: string;
  equipmentId: string;
  testDate: string;
  jumpLevel: number;
  sibilanceLevel: number;
  leftChannelDb: number;
  rightChannelDb: number;
  recordName?: string;
  notes?: string;
}
