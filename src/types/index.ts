export type AirQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'severe';
export type OdorLevel = 0 | 1 | 2 | 3;
export type AlertType = 'filter_expiring' | 'stock_low' | 'clean_needed';
export type AlertLevel = 'warning' | 'danger';
export type SeasonType = 'pet_shedding' | 'pollen';

export interface Device {
  id: string;
  room: string;
  model: string;
  area: number;
  filterSpec: string;
  purchaseDate: string;
  photo: string;
  lastCleanDate: string;
  expectedFilterDays: number;
  currentFilterStartDate: string;
  pm25: number;
  airQuality: AirQuality;
  odorLevel: OdorLevel;
}

export interface ReplacementRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  oldFilterDays: number;
  newFilterBatch: string;
  newFilterSpec: string;
  installer: string;
  remainingStock: number;
  date: string;
  note?: string;
}

export interface FilterBatch {
  id: string;
  batchNo: string;
  spec: string;
  quantity: number;
  purchaseDate: string;
  supplier?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  deviceId?: string;
  filterSpec?: string;
  message: string;
  triggeredAt: string;
  resolved: boolean;
}

export interface CleanRecord {
  id: string;
  deviceId: string;
  date: string;
  operator: string;
  note?: string;
}

export interface SeasonalSetting {
  type: SeasonType;
  enabled: boolean;
  startMonth: number;
  endMonth: number;
  consumptionFactor: number;
}

export interface AlertThresholds {
  filterExpiringDays: number;
  safeStockPerSpec: number;
  cleanReminderDays: number;
  pm25AccelerateThreshold: number;
  odorAccelerateLevel: number;
}
