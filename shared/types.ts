export type ShiftType = 'morning' | 'evening' | 'all';

export interface DenominationItem {
  denomination: number;
  count: number;
}

export interface Register {
  id: string;
  code: string;
  shift: ShiftType;
  defaultAmount: number;
  managerName: string;
  managerPhoto: string;
  threshold: number;
  createdAt: string;
  updatedAt: string;
}

export type ScanCodeStatus = 'normal' | 'damaged' | 'missing';

export type HandoverStatus = 'normal' | 'warning' | 'danger';

export interface Handover {
  id: string;
  registerId: string;
  registerCode: string;
  shift: 'morning' | 'evening';
  shiftDate: string;
  defaultAmount: number;
  denominations: DenominationItem[];
  actualAmount: number;
  difference: number;
  differenceReason?: string;
  scanCodeStatus: ScanCodeStatus;
  scanCodeNote?: string;
  pendingItems: string;
  handoverPerson: string;
  handoverSignature: string;
  successorPerson: string;
  successorSignature: string;
  handoverTime: string;
  scheduledTime: string;
  isOnTime: boolean;
  status: HandoverStatus;
  createdAt: string;
}

export type TransactionType = 'loan' | 'replenish' | 'deposit';

export interface Transaction {
  id: string;
  type: TransactionType;
  registerId: string;
  amount: number;
  relatedHandoverId?: string;
  operator: string;
  note?: string;
  createdAt: string;
}

export interface OverviewStats {
  todayHandovers: number;
  pendingDifferences: number;
  weeklyPunctuality: number;
  totalRegisters: number;
}

export interface ShiftDifferenceStat {
  shift: 'morning' | 'evening';
  count: number;
  totalAmount: number;
}

export interface DenominationStat {
  denomination: number;
  shortageCount: number;
  surplusCount: number;
}

export interface PendingDifference {
  handoverId: string;
  registerCode: string;
  amount: number;
  date: string;
}

export interface PunctualityDay {
  date: string;
  rate: number;
  total: number;
  onTime: number;
}

export interface StatsResponse {
  shiftDifferences: ShiftDifferenceStat[];
  denominationStats: DenominationStat[];
  pendingDifferences: PendingDifference[];
  punctualityRate: PunctualityDay[];
  overview: OverviewStats;
}

export const DENOMINATIONS = [100, 50, 20, 10, 5, 1, 0.5, 0.1];
