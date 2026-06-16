import { create } from 'zustand';
import type {
  Budget,
  Reimbursement,
  Club,
  Teacher,
  BudgetStatus,
  ReimbursementStatus,
  ApprovalLog,
  BudgetStatistics,
  OverBudgetItem,
  PendingReimbursement,
} from '@/types';
import { mockBudgets, mockReimbursements, mockClubs, mockTeachers } from '@/data/mockData';
import { generateId, getDaysSince } from '@/utils/format';

interface AppState {
  clubs: Club[];
  teachers: Teacher[];
  budgets: Budget[];
  reimbursements: Reimbursement[];

  addBudget: (budget: Omit<Budget, 'id' | 'usedAmount' | 'status' | 'createdAt'>) => void;
  approveBudget: (budgetId: string) => void;
  rejectBudget: (budgetId: string, comment: string) => void;
  getBudgetById: (id: string) => Budget | undefined;
  getBudgetsByClub: (clubId: string) => Budget[];
  getActiveBudgets: () => Budget[];

  addReimbursement: (
    reimbursement: Omit<Reimbursement, 'id' | 'status' | 'isOverBudget' | 'approvalLogs' | 'createdAt'>
  ) => string;
  submitReimbursement: (id: string) => void;
  approveReimbursementByTeacher: (id: string, comment: string) => void;
  approveReimbursementByFinance: (id: string, comment: string) => void;
  rejectReimbursement: (id: string, role: string, comment: string) => void;
  getReimbursementById: (id: string) => Reimbursement | undefined;
  getReimbursementsByBudget: (budgetId: string) => Reimbursement[];
  getReimbursementsByStatus: (status: ReimbursementStatus) => Reimbursement[];

  getBudgetStatistics: () => BudgetStatistics[];
  getOverBudgetItems: () => OverBudgetItem[];
  getLongPendingReimbursements: (daysThreshold?: number) => PendingReimbursement[];
  getDashboardStats: () => {
    totalBudget: number;
    usedBudget: number;
    remainingBudget: number;
    pendingCount: number;
    pendingTeacherCount: number;
    pendingFinanceCount: number;
    draftCount: number;
    paidCount: number;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  clubs: mockClubs,
  teachers: mockTeachers,
  budgets: mockBudgets,
  reimbursements: mockReimbursements,

  addBudget: (budgetData) => {
    const newBudget: Budget = {
      ...budgetData,
      id: generateId(),
      usedAmount: 0,
      status: 'pending_teacher' as BudgetStatus,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      budgets: [newBudget, ...state.budgets],
    }));
  },

  approveBudget: (budgetId) => {
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === budgetId ? { ...b, status: 'active' as BudgetStatus } : b
      ),
    }));
  },

  rejectBudget: (budgetId) => {
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === budgetId ? { ...b, status: 'rejected' as BudgetStatus } : b
      ),
    }));
  },

  getBudgetById: (id) => {
    return get().budgets.find((b) => b.id === id);
  },

  getBudgetsByClub: (clubId) => {
    return get().budgets.filter((b) => b.clubId === clubId);
  },

  getActiveBudgets: () => {
    return get().budgets.filter((b) => b.status === 'active');
  },

  addReimbursement: (reimData) => {
    const budget = get().budgets.find((b) => b.id === reimData.budgetId);
    const isOverBudget = budget
      ? budget.usedAmount + reimData.amount > budget.amount
      : false;

    const newId = generateId();
    const newReimbursement: Reimbursement = {
      ...reimData,
      id: newId,
      status: 'draft' as ReimbursementStatus,
      isOverBudget,
      approvalLogs: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      reimbursements: [newReimbursement, ...state.reimbursements],
    }));
    return newId;
  },

  submitReimbursement: (id) => {
    const reim = get().reimbursements.find((r) => r.id === id);
    if (!reim) return;

    const budget = get().budgets.find((b) => b.id === reim.budgetId);
    const isOverBudget = budget
      ? budget.usedAmount + reim.amount > budget.amount
      : false;

    const newStatus: ReimbursementStatus = isOverBudget ? 'pending_teacher' : 'pending_finance';

    const log: ApprovalLog = {
      id: generateId(),
      approver: reim.purchaser,
      role: '社团成员',
      action: 'submit',
      comment: isOverBudget ? '提交报销申请（超预算，需老师审批）' : '提交报销申请',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      reimbursements: state.reimbursements.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              isOverBudget,
              approvalLogs: [...r.approvalLogs, log],
            }
          : r
      ),
    }));
  },

  approveReimbursementByTeacher: (id, comment) => {
    const log: ApprovalLog = {
      id: generateId(),
      approver: '指导老师',
      role: '指导老师',
      action: 'approve',
      comment: comment || '同意报销',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      reimbursements: state.reimbursements.map((r) =>
        r.id === id
          ? { ...r, status: 'pending_finance' as ReimbursementStatus, approvalLogs: [...r.approvalLogs, log] }
          : r
      ),
    }));
  },

  approveReimbursementByFinance: (id, comment) => {
    const reim = get().reimbursements.find((r) => r.id === id);
    if (!reim) return;

    const log: ApprovalLog = {
      id: generateId(),
      approver: '财务处',
      role: '财务',
      action: 'approve',
      comment: comment || '已打款',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedBudgets = state.budgets.map((b) =>
        b.id === reim.budgetId
          ? { ...b, usedAmount: b.usedAmount + reim.amount }
          : b
      );

      const updatedReimbursements = state.reimbursements.map((r) =>
        r.id === id
          ? { ...r, status: 'paid' as ReimbursementStatus, approvalLogs: [...r.approvalLogs, log] }
          : r
      );

      return {
        budgets: updatedBudgets,
        reimbursements: updatedReimbursements,
      };
    });
  },

  rejectReimbursement: (id, role, comment) => {
    const approver = role === '指导老师' ? '指导老师' : '财务处';

    const log: ApprovalLog = {
      id: generateId(),
      approver,
      role,
      action: 'reject',
      comment: comment || '驳回申请',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      reimbursements: state.reimbursements.map((r) =>
        r.id === id
          ? { ...r, status: 'draft' as ReimbursementStatus, approvalLogs: [...r.approvalLogs, log] }
          : r
      ),
    }));
  },

  getReimbursementById: (id) => {
    return get().reimbursements.find((r) => r.id === id);
  },

  getReimbursementsByBudget: (budgetId) => {
    return get().reimbursements.filter((r) => r.budgetId === budgetId);
  },

  getReimbursementsByStatus: (status) => {
    return get().reimbursements.filter((r) => r.status === status);
  },

  getBudgetStatistics: () => {
    const { clubs, budgets, reimbursements } = get();

    return clubs.map((club) => {
      const clubBudgets = budgets.filter((b) => b.clubId === club.id);
      const clubReims = reimbursements.filter(
        (r) => r.clubId === club.id && r.status === 'paid'
      );

      const totalBudget = clubBudgets.reduce((sum, b) => sum + b.amount, 0);
      const usedBudget = clubReims.reduce((sum, r) => sum + r.amount, 0);

      return {
        clubId: club.id,
        clubName: club.name,
        totalBudget,
        usedBudget,
        remainingBudget: totalBudget - usedBudget,
        budgetCount: clubBudgets.length,
        reimbursementCount: clubReims.length,
      };
    });
  },

  getOverBudgetItems: () => {
    const { budgets, reimbursements } = get();

    const overBudgetBudgets: OverBudgetItem[] = [];

    budgets.forEach((budget) => {
      if (budget.usedAmount > budget.amount) {
        overBudgetBudgets.push({
          id: budget.id,
          budgetName: budget.name,
          clubName: budget.clubName,
          budgetAmount: budget.amount,
          usedAmount: budget.usedAmount,
          overAmount: budget.usedAmount - budget.amount,
          overPercentage: Math.round(((budget.usedAmount - budget.amount) / budget.amount) * 100),
        });
      }
    });

    reimbursements
      .filter((r) => r.isOverBudget && r.status !== 'paid' && r.status !== 'rejected' && r.status !== 'draft')
      .forEach((reim) => {
        const budget = budgets.find((b) => b.id === reim.budgetId);
        if (budget && budget.usedAmount + reim.amount > budget.amount) {
          const existing = overBudgetBudgets.find((o) => o.id === budget.id);
          if (!existing) {
            overBudgetBudgets.push({
              id: budget.id,
              budgetName: budget.name,
              clubName: budget.clubName,
              budgetAmount: budget.amount,
              usedAmount: budget.usedAmount + reim.amount,
              overAmount: budget.usedAmount + reim.amount - budget.amount,
              overPercentage: Math.round(
                ((budget.usedAmount + reim.amount - budget.amount) / budget.amount) * 100
              ),
            });
          }
        }
      });

    return overBudgetBudgets.sort((a, b) => b.overAmount - a.overAmount);
  },

  getLongPendingReimbursements: (daysThreshold = 30) => {
    const { reimbursements } = get();

    return reimbursements
      .filter((r) => r.status !== 'paid' && r.status !== 'rejected')
      .map((r) => ({
        id: r.id,
        budgetName: r.budgetName,
        clubName: r.clubName,
        amount: r.amount,
        purchaser: r.purchaser,
        status: r.status,
        daysPending: getDaysSince(r.createdAt),
        createdAt: r.createdAt,
      }))
      .filter((r) => r.daysPending >= daysThreshold)
      .sort((a, b) => b.daysPending - a.daysPending);
  },

  getDashboardStats: () => {
    const { budgets, reimbursements } = get();

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const paidReims = reimbursements.filter((r) => r.status === 'paid');
    const usedBudget = paidReims.reduce((sum, r) => sum + r.amount, 0);
    const remainingBudget = totalBudget - usedBudget;

    const draftCount = reimbursements.filter((r) => r.status === 'draft').length;
    const pendingTeacherCount = reimbursements.filter((r) => r.status === 'pending_teacher').length;
    const pendingFinanceCount = reimbursements.filter((r) => r.status === 'pending_finance').length;
    const pendingCount = pendingTeacherCount + pendingFinanceCount;
    const paidCount = paidReims.length;

    return {
      totalBudget,
      usedBudget,
      remainingBudget,
      pendingCount,
      pendingTeacherCount,
      pendingFinanceCount,
      draftCount,
      paidCount,
    };
  },
}));
