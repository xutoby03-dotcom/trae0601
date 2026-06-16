export type BudgetStatus = 'pending_teacher' | 'active' | 'rejected';

export type ReimbursementStatus =
  | 'draft'
  | 'pending_teacher'
  | 'pending_finance'
  | 'paid'
  | 'rejected';

export interface Club {
  id: string;
  name: string;
  totalBudget: number;
}

export interface Teacher {
  id: string;
  name: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
}

export interface Budget {
  id: string;
  clubId: string;
  clubName: string;
  name: string;
  purpose: string;
  category: string;
  amount: number;
  usedAmount: number;
  teacherId: string;
  teacherName: string;
  status: BudgetStatus;
  createdAt: string;
}

export interface Reimbursement {
  id: string;
  budgetId: string;
  budgetName: string;
  clubId: string;
  clubName: string;
  purchaser: string;
  amount: number;
  category: string;
  paymentMethod: string;
  status: ReimbursementStatus;
  isOverBudget: boolean;
  receiptUrl: string;
  receiptName: string;
  description: string;
  createdAt: string;
  approvalLogs: ApprovalLog[];
}

export interface ApprovalLog {
  id: string;
  approver: string;
  role: string;
  action: 'submit' | 'approve' | 'reject';
  comment: string;
  createdAt: string;
}

export interface BudgetStatistics {
  clubId: string;
  clubName: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  budgetCount: number;
  reimbursementCount: number;
}

export interface OverBudgetItem {
  id: string;
  budgetName: string;
  clubName: string;
  budgetAmount: number;
  usedAmount: number;
  overAmount: number;
  overPercentage: number;
}

export interface PendingReimbursement {
  id: string;
  budgetName: string;
  clubName: string;
  amount: number;
  purchaser: string;
  status: ReimbursementStatus;
  daysPending: number;
  createdAt: string;
}

export const PAYMENT_METHODS = ['微信支付', '支付宝', '现金', '银行卡'];

export const BUDGET_CATEGORIES = [
  '宣传物料',
  '活动用品',
  '场地租赁',
  '餐饮费用',
  '交通费用',
  '奖品礼品',
  '其他',
];
