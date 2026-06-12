export type ColorGrade = 'light' | 'good' | 'dark' | 'burnt';

export type BatchStatus = 'baking' | 'finished';

export interface Oven {
  id: string;
  name: string;
  layers: number;
  status: 'active' | 'inactive';
}

export interface Batch {
  id: string;
  productName: string;
  quantity: number;
  ovenId: string;
  layer: number;
  startTime: string;
  targetDuration: number;
  temperature: number;
  entryPhoto?: string;
  finishTime?: string;
  actualDuration?: number;
  colorGrade?: ColorGrade;
  lossQuantity?: number;
  lossReason?: string;
  finishPhoto?: string;
  status: BatchStatus;
}

export interface NewBatchInput {
  productName: string;
  quantity: number;
  ovenId: string;
  layer: number;
  targetDuration: number;
  temperature: number;
  entryPhoto?: string;
}

export interface FinishBatchInput {
  actualDuration: number;
  colorGrade: ColorGrade;
  lossQuantity: number;
  lossReason?: string;
  finishPhoto?: string;
}

export type CountdownStatus = 'normal' | 'warning' | 'danger' | 'overtime';

export interface LossStat {
  productName: string;
  lossQuantity: number;
  totalQuantity: number;
  lossRate: number;
}

export interface OvenUtilization {
  ovenId: string;
  ovenName: string;
  totalMinutes: number;
  utilizationRate: number;
}
