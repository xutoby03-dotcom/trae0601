import { create } from 'zustand';
import type { Reimbursement, ReimbursementFormData, Project } from '@/types';
import { mockReimbursements, mockProjects } from '@/data/mockData';

interface ReimbursementState {
  reimbursements: Reimbursement[];
  projects: Project[];
  addReimbursement: (data: ReimbursementFormData) => void;
  approveReimbursement: (id: string, comment?: string) => void;
  rejectReimbursement: (id: string, comment: string) => void;
  batchApproveByProject: (projectId: string) => number;
  settleReimbursement: (id: string) => void;
  getPendingCount: () => number;
  getOverStandardCount: () => number;
  getMissingInvoiceCount: () => number;
  getUnsettledAmount: () => number;
  isOverStandard: (amount: number, peopleCount: number, projectId: string) => boolean;
  getProjectStandard: (projectId: string) => number;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useReimbursementStore = create<ReimbursementState>((set, get) => ({
  reimbursements: mockReimbursements,
  projects: mockProjects,

  addReimbursement: (data: ReimbursementFormData) => {
    const project = get().projects.find((p) => p.id === data.projectId);
    const newItem: Reimbursement = {
      id: generateId(),
      date: data.date,
      projectId: data.projectId,
      projectName: project?.name || '',
      department: project?.department || '',
      employeeName: data.employeeName,
      peopleCount: data.peopleCount,
      shopName: data.shopName,
      amount: data.amount,
      invoiceStatus: data.invoiceStatus,
      receiptImage: data.receiptImage,
      overStandardReason: data.overStandardReason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      reimbursements: [newItem, ...state.reimbursements],
    }));
  },

  approveReimbursement: (id: string, comment?: string) => {
    set((state) => ({
      reimbursements: state.reimbursements.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'approved',
              reviewer: '管理员',
              reviewComment: comment,
              reviewedAt: new Date().toISOString(),
            }
          : item
      ),
    }));
  },

  rejectReimbursement: (id: string, comment: string) => {
    set((state) => ({
      reimbursements: state.reimbursements.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rejected',
              reviewer: '管理员',
              reviewComment: comment,
              reviewedAt: new Date().toISOString(),
            }
          : item
      ),
    }));
  },

  batchApproveByProject: (projectId: string) => {
    let count = 0;
    set((state) => {
      const updated = state.reimbursements.map((item) => {
        if (
          item.projectId === projectId &&
          item.status === 'pending' &&
          item.invoiceStatus !== 'missing'
        ) {
          count++;
          return {
            ...item,
            status: 'approved' as const,
            reviewer: '管理员',
            reviewedAt: new Date().toISOString(),
          };
        }
        return item;
      });
      return { reimbursements: updated };
    });
    return count;
  },

  settleReimbursement: (id: string) => {
    set((state) => ({
      reimbursements: state.reimbursements.map((item) =>
        item.id === id ? { ...item, status: 'settled' } : item
      ),
    }));
  },

  getPendingCount: () => {
    return get().reimbursements.filter((r) => r.status === 'pending').length;
  },

  getOverStandardCount: () => {
    const { reimbursements, projects } = get();
    return reimbursements.filter((r) => {
      if (r.status !== 'pending') return false;
      const project = projects.find((p) => p.id === r.projectId);
      if (!project) return false;
      return r.amount / r.peopleCount > project.standardAmount;
    }).length;
  },

  getMissingInvoiceCount: () => {
    return get().reimbursements.filter(
      (r) => r.status === 'pending' && r.invoiceStatus === 'missing'
    ).length;
  },

  getUnsettledAmount: () => {
    return get()
      .reimbursements.filter((r) => r.status !== 'settled' && r.status !== 'rejected')
      .reduce((sum, r) => sum + r.amount, 0);
  },

  isOverStandard: (amount: number, peopleCount: number, projectId: string) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project || peopleCount === 0) return false;
    return amount / peopleCount > project.standardAmount;
  },

  getProjectStandard: (projectId: string) => {
    const project = get().projects.find((p) => p.id === projectId);
    return project?.standardAmount || 0;
  },
}));
