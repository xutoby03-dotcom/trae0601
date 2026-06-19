export type TablewareType = 'plate' | 'bowl' | 'chopsticks' | 'spoon';

export type MaterialType = 'stainless' | 'melamine' | 'ceramic';

export type TablewareStatus = 'normal' | 'pending_review' | 'off_shelf' | 'scrapped';

export type SeverityLevel = 'minor' | 'moderate' | 'severe';

export type ReportStatus = 'pending' | 'processing' | 'completed';

export type DisinfectionStatus = 'qualified' | 'unqualified';

export interface Window {
  id: string;
  name: string;
  location: string;
}

export interface Tableware {
  id: string;
  batchNo: string;
  type: TablewareType;
  material: MaterialType;
  quantity: number;
  commissionDate: string;
  windowId: string;
  photo: string;
  status: TablewareStatus;
  damagedCount: number;
  scrappedCount: number;
}

export interface InspectionRecord {
  id: string;
  tablewareId: string;
  tablewareBatchNo: string;
  inspectionDate: string;
  inspector: string;
  crackCount: number;
  chipCount: number;
  deformationCount: number;
  oilStainCount: number;
  disinfectionStatus: DisinfectionStatus;
  remark: string;
}

export interface RepairReport {
  id: string;
  tablewareId: string;
  tablewareBatchNo: string;
  windowId: string;
  windowName: string;
  photo: string;
  damageType: string;
  severity: SeverityLevel;
  reporter?: string;
  reportTime: string;
  status: ReportStatus;
  remark?: string;
}

export interface DashboardStats {
  pendingCount: number;
  damageRate: number;
  scrappedCount: number;
  disinfectionAbnormal: number;
  needPurchase: number;
}

export interface WindowDamageRate {
  windowId: string;
  windowName: string;
  damageRate: number;
  totalCount: number;
  damagedCount: number;
}

export interface DamageTypeStats {
  name: string;
  value: number;
  color: string;
}
