export type RiskLevel = 'safe' | 'warning' | 'danger';
export type StatusLevel = 'good' | 'normal' | 'poor';
export type MoldStatus = 'none' | 'mild' | 'severe';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskType = 'replace' | 'clean' | 'repair';
export type UrgencyLevel = 'high' | 'medium' | 'low';

export interface Bathroom {
  id: string;
  name: string;
  location: string;
  matSize: string;
  matMaterial: string;
  suctionCupsCount: number;
  purchaseDate: string;
  recommendedLifespanDays: number;
  riskLevel: RiskLevel;
  suctionStatus: StatusLevel;
  cornerStatus: StatusLevel;
  moldStatus: MoldStatus;
  lastInspectionDate: string | null;
  lastCleaningDate: string | null;
  photoUrl: string | null;
}

export interface Inspection {
  id: string;
  bathroomId: string;
  inspectionDate: string;
  photoUrl: string | null;
  adsorptionOk: boolean;
  drainageOk: boolean;
  cleaningOk: boolean;
  dryingOk: boolean;
  handrailOk: boolean;
  notes: string;
  inspector: string;
}

export interface CleaningRecord {
  id: string;
  bathroomId: string;
  cleaningDate: string;
  cleanedBy: string;
  dryingLocation: string;
  daysUnhandled: number;
  notes: string;
}

export interface Task {
  id: string;
  bathroomId: string;
  type: TaskType;
  status: TaskStatus;
  createdDate: string;
  dueDate: string;
  reason: string;
  procurementSpecId: string | null;
}

export interface ProcurementSpec {
  id: string;
  name: string;
  size: string;
  material: string;
  suctionCups: number;
  thickness: string;
  color: string;
  notes: string;
  quantity: number;
}

export interface ProcurementItem {
  spec: ProcurementSpec;
  bathroomName: string;
  urgency: UrgencyLevel;
}

export interface CheckItem {
  key: keyof Pick<Inspection, 'adsorptionOk' | 'drainageOk' | 'cleaningOk' | 'dryingOk' | 'handrailOk'>;
  label: string;
  description: string;
  icon: string;
}
