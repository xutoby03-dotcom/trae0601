export type CuffSize = 'small' | 'medium' | 'large' | 'extra-large';
export type Arm = 'left' | 'right';
export type Posture = 'sitting' | 'standing' | 'lying';
export type AlertType = 'cuff' | 'calibration' | 'battery' | 'abnormal-reading';
export type AlertSeverity = 'info' | 'warning' | 'error';

export interface Device {
  id: string;
  brand: string;
  model: string;
  cuffSize: CuffSize;
  batteryType: string;
  purchaseDate: string;
  calibrationDate: string;
  batteryLevel: number;
  photo?: string;
  armCircumference?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  deviceId: string;
  date: string;
  time: string;
  arm: Arm;
  posture: Posture;
  restMinutes: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  notes?: string;
  isAbnormal: boolean;
  abnormalReason?: string;
  createdAt: string;
}

export interface Settings {
  id: string;
  nextVisitDate?: string;
  systolicHigh: number;
  systolicLow: number;
  diastolicHigh: number;
  diastolicLow: number;
  calibrationIntervalDays: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  measurementId?: string;
  createdAt: string;
}

export const cuffSizeLabels: Record<CuffSize, string> = {
  small: '小号（22-26cm）',
  medium: '中号（27-31cm）',
  large: '大号（32-36cm）',
  'extra-large': '特大号（37-42cm）',
};

export const armLabels: Record<Arm, string> = {
  left: '左臂',
  right: '右臂',
};

export const postureLabels: Record<Posture, string> = {
  sitting: '坐姿',
  standing: '站姿',
  lying: '卧姿',
};

export const alertTypeLabels: Record<AlertType, string> = {
  cuff: '袖带提醒',
  calibration: '校准提醒',
  battery: '电量提醒',
  'abnormal-reading': '读数异常',
};
