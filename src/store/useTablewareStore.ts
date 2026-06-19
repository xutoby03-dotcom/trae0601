import { create } from 'zustand';
import type { Tableware, InspectionRecord, RepairReport, DashboardStats, WindowDamageRate, DamageTypeStats } from '../types';
import { tablewareList, inspectionRecords, repairReports, dashboardStats as initialStats, windowDamageRates as initialRates, damageTypeStats as initialTypeStats } from '../data/mockData';

interface TablewareState {
  tablewareList: Tableware[];
  inspectionRecords: InspectionRecord[];
  repairReports: RepairReport[];
  dashboardStats: DashboardStats;
  windowDamageRates: WindowDamageRate[];
  damageTypeStats: DamageTypeStats[];
  
  addTableware: (tableware: Omit<Tableware, 'id'>) => void;
  updateTableware: (id: string, data: Partial<Tableware>) => void;
  deleteTableware: (id: string) => void;
  
  addInspection: (record: Omit<InspectionRecord, 'id'>) => void;
  
  addRepairReport: (report: Omit<RepairReport, 'id' | 'status'>) => void;
  updateReportStatus: (id: string, status: RepairReport['status']) => void;
  
  getPendingReports: () => RepairReport[];
  getOffShelfCount: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTablewareStore = create<TablewareState>((set, get) => ({
  tablewareList,
  inspectionRecords,
  repairReports,
  dashboardStats: initialStats,
  windowDamageRates: initialRates,
  damageTypeStats: initialTypeStats,

  addTableware: (tableware) =>
    set((state) => ({
      tablewareList: [
        ...state.tablewareList,
        { ...tableware, id: generateId() },
      ],
    })),

  updateTableware: (id, data) =>
    set((state) => ({
      tablewareList: state.tablewareList.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),

  deleteTableware: (id) =>
    set((state) => ({
      tablewareList: state.tablewareList.filter((item) => item.id !== id),
    })),

  addInspection: (record) =>
    set((state) => ({
      inspectionRecords: [
        { ...record, id: generateId() },
        ...state.inspectionRecords,
      ],
    })),

  addRepairReport: (report) => {
    const newReport: RepairReport = {
      ...report,
      id: generateId(),
      status: 'pending',
    };
    set((state) => ({
      repairReports: [newReport, ...state.repairReports],
      dashboardStats: {
        ...state.dashboardStats,
        pendingCount: state.dashboardStats.pendingCount + 1,
      },
    }));
    
    if (report.severity === 'severe') {
      const { updateTableware } = get();
      updateTableware(report.tablewareId, { status: 'off_shelf' });
    } else if (report.severity === 'moderate' || report.severity === 'minor') {
      const { updateTableware } = get();
      updateTableware(report.tablewareId, { status: 'pending_review' });
    }
  },

  updateReportStatus: (id, status) =>
    set((state) => ({
      repairReports: state.repairReports.map((report) =>
        report.id === id ? { ...report, status } : report
      ),
    })),

  getPendingReports: () => {
    return get().repairReports.filter((r) => r.status === 'pending');
  },

  getOffShelfCount: () => {
    return get().tablewareList.filter((t) => t.status === 'off_shelf').length;
  },
}));
