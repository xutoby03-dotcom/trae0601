import { create } from 'zustand';
import type { ArchiveBox, BorrowRecord, ReturnCheck, User, SearchFilters, SecurityLevel, BoxStatus } from '../types';
import { mockArchiveBoxes, mockBorrowRecords, mockUsers } from '../data/mockData';
import { generateId, isOverdue, needsManagerApproval, getToday } from '../utils';

interface AppState {
  currentUser: User;
  users: User[];
  archiveBoxes: ArchiveBox[];
  borrowRecords: BorrowRecord[];
  searchFilters: SearchFilters;

  setCurrentUser: (user: User) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  resetSearchFilters: () => void;

  addArchiveBox: (box: Omit<ArchiveBox, 'id' | 'createdAt' | 'updatedAt' | 'photos' | 'status'>) => void;
  updateArchiveBox: (id: string, updates: Partial<ArchiveBox>) => void;
  getArchiveBoxById: (id: string) => ArchiveBox | undefined;

  createBorrowRequest: (data: {
    archiveBoxId: string;
    borrowerId: string;
    borrowerName: string;
    borrowerDepartment: string;
    purpose: string;
    expectedReturnDate: string;
    allowTakeOut: boolean;
  }) => void;
  approveBorrow: (recordId: string, approverId: string, approverName: string, remark?: string) => void;
  managerApproveBorrow: (recordId: string, managerId: string, managerName: string) => void;
  rejectBorrow: (recordId: string, approverId: string, approverName: string, remark?: string) => void;
  confirmBorrowed: (recordId: string) => void;
  returnBorrow: (recordId: string, checkData: Omit<ReturnCheck, 'id' | 'borrowRecordId' | 'checkedAt'>) => void;

  getBorrowRecordsByBoxId: (boxId: string) => BorrowRecord[];
  getOverdueBoxes: () => ArchiveBox[];
  getSealAlertBoxes: () => ArchiveBox[];
  getUpcomingAuditBoxes: () => ArchiveBox[];
  getPendingApprovals: () => BorrowRecord[];
  getBorrowedByMe: (userId: string) => BorrowRecord[];
  getDepartmentBorrowStats: () => { department: string; count: number }[];

  filteredArchiveBoxes: () => ArchiveBox[];
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  archiveBoxes: mockArchiveBoxes,
  borrowRecords: mockBorrowRecords,
  searchFilters: {},

  setCurrentUser: (user) => set({ currentUser: user }),
  setSearchFilters: (filters) => set({ searchFilters: filters }),
  resetSearchFilters: () => set({ searchFilters: {} }),

  addArchiveBox: (box) => {
    const now = new Date().toISOString();
    const newBox: ArchiveBox = {
      ...box,
      id: generateId('b'),
      status: '在库' as BoxStatus,
      photos: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ archiveBoxes: [newBox, ...state.archiveBoxes] }));
  },

  updateArchiveBox: (id, updates) => {
    const now = new Date().toISOString();
    set((state) => ({
      archiveBoxes: state.archiveBoxes.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: now } : b
      ),
    }));
  },

  getArchiveBoxById: (id) => {
    return get().archiveBoxes.find((b) => b.id === id);
  },

  createBorrowRequest: (data) => {
    const box = get().archiveBoxes.find((b) => b.id === data.archiveBoxId);
    if (!box) return;
    const record: BorrowRecord = {
      id: generateId('br'),
      archiveBoxId: data.archiveBoxId,
      boxNumber: box.boxNumber,
      borrowerId: data.borrowerId,
      borrowerName: data.borrowerName,
      borrowerDepartment: data.borrowerDepartment,
      purpose: data.purpose,
      expectedReturnDate: data.expectedReturnDate,
      allowTakeOut: data.allowTakeOut,
      status: '待审批',
      needsManagerApproval: needsManagerApproval(box.securityLevel),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ borrowRecords: [record, ...state.borrowRecords] }));
  },

  approveBorrow: (recordId, approverId, approverName, remark) => {
    const now = new Date().toISOString();
    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) => {
        if (r.id !== recordId) return r;
        if (r.needsManagerApproval && !r.managerApproved) return r;
        return {
          ...r,
          status: '已通过',
          approverId,
          approverName,
          approvalRemark: remark,
          approvedAt: now,
        };
      }),
    }));
  },

  managerApproveBorrow: (recordId, _managerId, _managerName) => {
    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === recordId ? { ...r, managerApproved: true } : r
      ),
    }));
  },

  rejectBorrow: (recordId, approverId, approverName, remark) => {
    const now = new Date().toISOString();
    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: '已驳回', approverId, approverName, approvalRemark: remark, approvedAt: now }
          : r
      ),
    }));
  },

  confirmBorrowed: (recordId) => {
    const now = new Date().toISOString();
    const record = get().borrowRecords.find((r) => r.id === recordId);
    if (!record) return;
    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === recordId ? { ...r, status: '借出中', borrowedAt: now } : r
      ),
      archiveBoxes: state.archiveBoxes.map((b) =>
        b.id === record.archiveBoxId ? { ...b, status: '借出', currentBorrowId: recordId, updatedAt: now } : b
      ),
    }));
  },

  returnBorrow: (recordId, checkData) => {
    const now = new Date().toISOString();
    const returnCheck: ReturnCheck = {
      id: generateId('rc'),
      borrowRecordId: recordId,
      ...checkData,
      checkedAt: now,
    };
    const hasAnomaly = !checkData.sealIntact || !checkData.pagesComplete || !checkData.cabinetCorrect;
    const record = get().borrowRecords.find((r) => r.id === recordId);
    if (!record) return;

    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === recordId ? { ...r, status: '已归还', returnedAt: now, returnCheck } : r
      ),
      archiveBoxes: state.archiveBoxes.map((b) =>
        b.id === record.archiveBoxId
          ? { ...b, status: hasAnomaly ? '异常' : '在库', currentBorrowId: undefined, updatedAt: now }
          : b
      ),
    }));
  },

  getBorrowRecordsByBoxId: (boxId) => {
    return get().borrowRecords.filter((r) => r.archiveBoxId === boxId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getOverdueBoxes: () => {
    const { archiveBoxes, borrowRecords } = get();
    return borrowRecords
      .filter((r) => r.status === '借出中' && isOverdue(r.expectedReturnDate))
      .map((r) => archiveBoxes.find((b) => b.id === r.archiveBoxId))
      .filter((b): b is ArchiveBox => !!b);
  },

  getSealAlertBoxes: () => {
    return get().archiveBoxes.filter((b) => b.status === '异常');
  },

  getUpcomingAuditBoxes: () => {
    const { archiveBoxes } = get();
    return archiveBoxes
      .filter((b) => b.auditDate)
      .filter((b) => {
        const audit = new Date(b.auditDate!).getTime();
        const now = Date.now();
        const diff = (audit - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      })
      .sort((a, b) => (a.auditDate || '').localeCompare(b.auditDate || ''));
  },

  getPendingApprovals: () => {
    return get().borrowRecords.filter((r) => r.status === '待审批');
  },

  getBorrowedByMe: (userId) => {
    return get().borrowRecords
      .filter((r) => r.borrowerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getDepartmentBorrowStats: () => {
    const stats: Record<string, number> = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    get().borrowRecords.forEach((r) => {
      const d = new Date(r.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        stats[r.borrowerDepartment] = (stats[r.borrowerDepartment] || 0) + 1;
      }
    });
    const allDepts = ['行政部', '财务部', '市场部', '法务部', '人事部', '审计部'];
    return allDepts.map((d) => ({ department: d, count: stats[d] || 0 }));
  },

  filteredArchiveBoxes: () => {
    const { archiveBoxes, searchFilters } = get();
    return archiveBoxes.filter((b) => {
      if (searchFilters.contractNumber && !b.contractNumber?.includes(searchFilters.contractNumber)) return false;
      if (searchFilters.clientName && !b.clientName?.includes(searchFilters.clientName)) return false;
      if (searchFilters.year && String(b.year) !== String(searchFilters.year)) return false;
      if (searchFilters.cabinetLocation && !b.cabinetLocation.includes(searchFilters.cabinetLocation)) return false;
      if (searchFilters.securityLevel && b.securityLevel !== searchFilters.securityLevel) return false;
      if (searchFilters.status && b.status !== searchFilters.status) return false;
      if (searchFilters.department && b.department !== searchFilters.department) return false;
      return true;
    });
  },
}));

export { getToday };
