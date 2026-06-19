export interface Teapot {
  id: string;
  code: string;
  capacity: number;
  teaType: string;
  targetTempMin: number;
  targetTempMax: number;
  manager: string;
  photo: string;
  createdAt: string;
}

export interface TeaBatch {
  id: string;
  teapotId: string;
  brewTime: string;
  teaAmount: number;
  outputAmount: number;
  targetTimeSlot: string;
  discardTime: string;
  status: 'active' | 'discarded' | 'sold_out';
  createdAt: string;
}

export interface InspectionRecord {
  id: string;
  batchId: string;
  inspectTime: string;
  temperature: number;
  aroma: 'excellent' | 'good' | 'fair' | 'poor';
  color: 'excellent' | 'good' | 'fair' | 'poor';
  sediment: 'none' | 'slight' | 'moderate' | 'heavy';
  waterAdded: boolean;
  remainingAmount: number;
  isAbnormal: boolean;
  abnormalReason?: string;
}

export type AromaLevel = 'excellent' | 'good' | 'fair' | 'poor';
export type ColorLevel = 'excellent' | 'good' | 'fair' | 'poor';
export type SedimentLevel = 'none' | 'slight' | 'moderate' | 'heavy';
export type BatchStatus = 'active' | 'discarded' | 'sold_out';
