import { create } from 'zustand';
import type { Reimbursement, ReimbursementFormData, Project } from '@/types';
import { mockReimbursements, mockProjects } from '@/data/mockData';

const STORAGE_KEY_REIMBURSEMENTS = 'overtime-meal-reimbursements';
const STORAGE_KEY_INITIALIZED = 'overtime-meal-initialized';
const STORAGE_KEY_REIMBURSEMENTS_V2 = 'overtime-meal-reimbursements-v2';
const STORAGE_KEY_INITIALIZED_V2 = 'overtime-meal-initialized-v2';

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

const migrateReimbursement = (item: Reimbursement): Reimbursement => {
  const migrated: Reimbursement = { ...item };
  if (migrated.status === 'settled' && !migrated.settledAt) {
    migrated.settledAt = migrated.reviewedAt ?? migrated.createdAt;
  }
  if (migrated.status === 'settled' && !migrated.settledBy) {
    migrated.settledBy = migrated.reviewer ?? '管理员';
  }
  return migrated;
};

const loadReimbursements = (): Reimbursement[] => {
  if (typeof window === 'undefined') return mockReimbursements;

  let initialized = localStorage.getItem(STORAGE_KEY_INITIALIZED);
  let rawData = localStorage.getItem(STORAGE_KEY_REIMBURSEMENTS);

  if (!initialized && !rawData) {
    const v2Initialized = localStorage.getItem(STORAGE_KEY_INITIALIZED_V2);
    const v2Data = localStorage.getItem(STORAGE_KEY_REIMBURSEMENTS_V2);
    if (v2Initialized && v2Data) {
      initialized = v2Initialized;
      rawData = v2Data;
    }
  }

  if (!initialized) {
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEY_REIMBURSEMENTS, JSON.stringify(mockReimbursements));
    localStorage.removeItem(STORAGE_KEY_INITIALIZED_V2);
    localStorage.removeItem(STORAGE_KEY_REIMBURSEMENTS_V2);
    return mockReimbursements;
  }

  try {
    if (rawData) {
      const parsed: Reimbursement[] = JSON.parse(rawData);
      const migrated = parsed.map(migrateReimbursement);
      localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
      localStorage.setItem(STORAGE_KEY_REIMBURSEMENTS, JSON.stringify(migrated));
      localStorage.removeItem(STORAGE_KEY_INITIALIZED_V2);
      localStorage.removeItem(STORAGE_KEY_REIMBURSEMENTS_V2);
      return migrated;
    }
    return mockReimbursements;
  } catch {
    return mockReimbursements;
  }
};

const saveReimbursements = (list: Reimbursement[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REIMBURSEMENTS, JSON.stringify(list));
  } catch {
    // silent
  }
};

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useReimbursementStore = create<ReimbursementState>((set, get) => ({
  reimbursements: loadReimbursements(),
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
    set((state) => {
      const updated = [newItem, ...state.reimbursements];
      saveReimbursements(updated);
      return { reimbursements: updated };
    });
  },

  approveReimbursement: (id: string, comment?: string) => {
    set((state) => {
      const updated = state.reimbursements.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'approved' as const,
              reviewer: '管理员',
              reviewComment: comment,
              reviewedAt: new Date().toISOString(),
            }
          : item
      );
      saveReimbursements(updated);
      return { reimbursements: updated };
    });
  },

  rejectReimbursement: (id: string, comment: string) => {
    set((state) => {
      const updated = state.reimbursements.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rejected' as const,
              reviewer: '管理员',
              reviewComment: comment,
              reviewedAt: new Date().toISOString(),
            }
          : item
      );
      saveReimbursements(updated);
      return { reimbursements: updated };
    });
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
      saveReimbursements(updated);
      return { reimbursements: updated };
    });
    return count;
  },

  settleReimbursement: (id: string) => {
    set((state) => {
      const updated = state.reimbursements.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'settled' as const,
              settledBy: '管理员',
              settledAt: new Date().toISOString(),
            }
          : item
      );
      saveReimbursements(updated);
      return { reimbursements: updated };
    });
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
