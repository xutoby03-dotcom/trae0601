export interface Roommate {
  id: string;
  name: string;
  avatar?: string;
}

export type ReimbursementStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface ReimbursementItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  applicant: string;
  status: ReimbursementStatus;
  receiptUrl?: string;
  createdAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}
