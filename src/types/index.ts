export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'settled';

export type InvoiceStatus = 'provided' | 'missing' | 'partial';

export type SummaryDimension = 'week' | 'department' | 'project';

export interface Project {
  id: string;
  name: string;
  department: string;
  standardAmount: number;
}

export interface Reimbursement {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  department: string;
  employeeName: string;
  peopleCount: number;
  shopName: string;
  amount: number;
  invoiceStatus: InvoiceStatus;
  receiptImage: string;
  overStandardReason?: string;
  status: ReimbursementStatus;
  reviewer?: string;
  reviewComment?: string;
  createdAt: string;
  reviewedAt?: string;
  settledBy?: string;
  settledAt?: string;
}

export interface ReimbursementFormData {
  date: string;
  projectId: string;
  employeeName: string;
  peopleCount: number;
  shopName: string;
  amount: number;
  invoiceStatus: InvoiceStatus;
  receiptImage: string;
  overStandardReason?: string;
}
