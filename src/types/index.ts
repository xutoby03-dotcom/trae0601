export interface Equipment {
  id: string;
  code: string;
  capacity: number;
  layers: number;
  probePositions: string[];
  photo?: string;
  photoName?: string;
  createdAt: string;
}

export interface Probe {
  id: string;
  equipmentId: string;
  position: string;
  calibrationCycle: number;
  lastCalibration: string;
  status: 'normal' | 'need_calibration' | 'fault';
}

export interface Maintenance {
  id: string;
  equipmentId: string;
  date: string;
  content: string;
  photo?: string;
}

export interface Batch {
  id: string;
  equipmentId: string;
  recipe: string;
  weight: number;
  targetTemp: number;
  inTime: string;
  expectOutTime: string;
  layer: number;
  status: 'fermenting' | 'completed' | 'abnormal';
}

export interface Inspection {
  id: string;
  equipmentId: string;
  time: string;
  actualTemp: number;
  humidity: number;
  doorFrequentOpen: boolean;
  frosting: boolean;
  abnormalSound: boolean;
  remark?: string;
}

export interface TemperatureRecord {
  time: string;
  temperature: number;
  isAbnormal: boolean;
}

export interface AbnormalLog {
  id: string;
  inspectionId: string;
  batchIds: string[];
  type: 'temp_high' | 'temp_low' | 'other';
  tempDeviation: number;
  status: 'pending' | 'resolved';
}

export const TEMP_MIN = 2;
export const TEMP_MAX = 6;
