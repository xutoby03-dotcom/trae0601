export type SealStatus = 'available' | 'in_use' | 'maintenance';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'checked_out' | 'returned' | 'overdue';
export type RecordStatus = 'checked_out' | 'returned' | 'overdue';

export interface Seal {
  id: string;
  type: string;
  sealNumber: string;
  custodian: string;
  scope: string;
  riskLevel: RiskLevel;
  photoUrl: string;
  status: SealStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  sealId: string;
  applicant: string;
  department: string;
  purpose: string;
  documentType: string;
  destination: string;
  expectedReturn: string;
  companion: string;
  approver: string;
  status: ApplicationStatus;
  rejectReason?: string;
  createdAt: string;
}

export interface SealRecord {
  id: string;
  applicationId: string;
  sealId: string;
  envelopeNumber: string;
  checkoutPhoto: string;
  checkoutTime: string;
  actualReturnTime?: string;
  stampedDocumentCount?: number;
  hasAnomaly?: boolean;
  anomalyRemark?: string;
  purposeMismatch?: boolean;
  status: RecordStatus;
}

export interface DepartmentStats {
  department: string;
  count: number;
}

export interface ScenarioStats {
  scenario: string;
  count: number;
}
