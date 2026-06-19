import { create } from 'zustand';
import type { Tableware, InspectionRecord, RepairReport, WindowDamageRate, DamageTypeStats } from '../types';
import { tablewareList, inspectionRecords, repairReports, windowDamageRates as initialRates, damageTypeStats as initialTypeStats } from '../data/mockData';

interface TablewareState {
  tablewareList: Tableware[];
  inspectionRecords: InspectionRecord[];
  repairReports: RepairReport[];
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
  getDashboardStats: () => {
    pendingCount: number;
    damageRate: number;
    scrappedCount: number;
    disinfectionAbnormal: number;
    needPurchase: number;
  };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const recalcDashboard = (state: TablewareState) => {
  const pendingCount = state.tablewareList.filter(
    (t) => t.status === 'pending_review' || t.status === 'off_shelf'
  ).length + state.repairReports.filter((r) => r.status === 'pending' || r.status === 'processing').length;

  const totalItems = state.tablewareList.reduce((sum, t) => sum + t.quantity, 0);
  const totalDamaged = state.tablewareList.reduce((sum, t) => sum + t.damagedCount, 0);
  const damageRate = totalItems > 0 ? (totalDamaged / totalItems) * 100 : 0;

  const scrappedCount = state.tablewareList.reduce((sum, t) => sum + t.scrappedCount, 0);

  const disinfectionAbnormal = state.inspectionRecords.filter(
    (r) => r.disinfectionStatus === 'unqualified'
  ).length;

  const needPurchase = state.tablewareList.filter(
    (t) => t.status === 'scrapped' || t.status === 'off_shelf'
  ).length;

  return { pendingCount, damageRate, scrappedCount, disinfectionAbnormal, needPurchase };
};

export const useTablewareStore = create<TablewareState>((set, get) => ({
  tablewareList,
  inspectionRecords,
  repairReports,
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

  addInspection: (record) => {
    const newRecord: InspectionRecord = { ...record, id: generateId() };

    set((state) => {
      const updatedTableware = state.tablewareList.map((item) => {
        if (item.id !== record.tablewareId) return item;
        if (record.severity === 'severe') {
          return { ...item, status: 'off_shelf' as const };
        }
        if (record.severity === 'minor' || record.severity === 'moderate') {
          return { ...item, status: 'pending_review' as const };
        }
        return item;
      });

      const nextState = {
        ...state,
        inspectionRecords: [newRecord, ...state.inspectionRecords],
        tablewareList: updatedTableware,
      };

      return nextState;
    });
  },

  addRepairReport: (report) => {
    const newReport: RepairReport = {
      ...report,
      id: generateId(),
      status: 'pending',
    };
    set((state) => {
      const updatedTableware = state.tablewareList.map((item) => {
        if (item.id !== report.tablewareId) return item;
        if (report.severity === 'severe') {
          return { ...item, status: 'off_shelf' as const };
        }
        if (report.severity === 'moderate' || report.severity === 'minor') {
          return { ...item, status: 'pending_review' as const };
        }
        return item;
      });

      return {
        repairReports: [newReport, ...state.repairReports],
        tablewareList: updatedTableware,
      };
    });
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

  getDashboardStats: () => {
    return recalcDashboard(get());
  },
}));
