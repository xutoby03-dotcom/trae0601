import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LossReport, LossItem, Recheck } from '@/types';
import { mockLossReports, mockRechecks } from '@/utils/mockData';
import { generateId } from '@/utils/format';
import { useFreezerStore } from './freezerStore';

interface LossReportStore {
  lossReports: LossReport[];
  rechecks: Recheck[];
  getLossReportById: (id: string) => LossReport | undefined;
  getLossReportsByFreezer: (freezerId: string) => LossReport[];
  getPendingCount: () => number;
  addLossReport: (
    report: Omit<LossReport, 'id' | 'status' | 'totalAmount' | 'createdAt' | 'items'> & { items: Omit<LossItem, 'id' | 'subtotal'>[] }
  ) => void;
  updateLossReport: (id: string, report: Partial<LossReport>) => void;
  approveLossReport: (id: string, reviewer: string, notes?: string) => void;
  rejectLossReport: (id: string, reviewer: string, notes?: string) => void;
  addRecheck: (recheck: Omit<Recheck, 'id'>) => void;
  getRechecksByFreezer: (freezerId: string) => Recheck[];
  getStatistics: () => {
    totalAbnormal: number;
    totalLossAmount: number;
    lossByCategory: { name: string; value: number }[];
    lossByShift: { name: string; count: number; amount: number }[];
    abnormalByFreezer: { name: string; count: number }[];
    lossByMonth: { month: string; amount: number }[];
  };
}

export const useLossReportStore = create<LossReportStore>()(
  persist(
    (set, get) => ({
      lossReports: mockLossReports,
      rechecks: mockRechecks,

      getLossReportById: (id) => {
        return get().lossReports.find((r) => r.id === id);
      },

      getLossReportsByFreezer: (freezerId) => {
        return get().lossReports
          .filter((r) => r.freezerId === freezerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getPendingCount: () => {
        return get().lossReports.filter((r) => r.status === 'pending').length;
      },

      addLossReport: (report) => {
        const items: LossItem[] = report.items.map((item) => ({
          ...item,
          id: generateId(),
          subtotal: item.unitPrice * item.quantity,
        }));

        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

        const newReport: LossReport = {
          ...report,
          id: generateId(),
          status: 'pending',
          totalAmount,
          items,
          createdAt: new Date().toISOString(),
        };

        set({ lossReports: [newReport, ...get().lossReports] });
      },

      updateLossReport: (id, report) => {
        set({
          lossReports: get().lossReports.map((r) => (r.id === id ? { ...r, ...report } : r)),
        });
      },

      approveLossReport: (id, reviewer, notes) => {
        set({
          lossReports: get().lossReports.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'approved',
                  reviewer,
                  reviewTime: new Date().toISOString(),
                  reviewNotes: notes,
                }
              : r
          ),
        });
      },

      rejectLossReport: (id, reviewer, notes) => {
        set({
          lossReports: get().lossReports.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'rejected',
                  reviewer,
                  reviewTime: new Date().toISOString(),
                  reviewNotes: notes,
                }
              : r
          ),
        });
      },

      addRecheck: (recheck) => {
        const newRecheck: Recheck = {
          ...recheck,
          id: generateId(),
          isResolved: true,
        };
        set({ rechecks: [newRecheck, ...get().rechecks] });

        useFreezerStore.getState().updateFreezerStatus(recheck.freezerId, 'normal');
      },

      getRechecksByFreezer: (freezerId) => {
        return get().rechecks
          .filter((r) => r.freezerId === freezerId)
          .sort((a, b) => new Date(b.recheckTime).getTime() - new Date(a.recheckTime).getTime());
      },

      getStatistics: () => {
        const { lossReports } = get();
        const { freezers } = useFreezerStore.getState();
        const { inspections } = useInspectionStore.getState();

        const approvedReports = lossReports.filter((r) => r.status === 'approved');
        const totalLossAmount = approvedReports.reduce((sum, r) => sum + r.totalAmount, 0);

        const categoryMap = new Map<string, number>();
        approvedReports.forEach((report) => {
          report.items.forEach((item) => {
            const current = categoryMap.get(item.category) || 0;
            categoryMap.set(item.category, current + item.quantity);
          });
        });
        const lossByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value,
        }));

        const shiftMap = new Map<string, { count: number; amount: number }>();
        approvedReports.forEach((report) => {
          const inspection = inspections.find((i) => i.id === report.inspectionId);
          const shift = inspection?.shift || 'morning';
          const current = shiftMap.get(shift) || { count: 0, amount: 0 };
          shiftMap.set(shift, {
            count: current.count + 1,
            amount: current.amount + report.totalAmount,
          });
        });
        const shiftLabels: Record<string, string> = {
          morning: '早班',
          afternoon: '午班',
          night: '晚班',
        };
        const lossByShift = Array.from(shiftMap.entries()).map(([shift, data]) => ({
          name: shiftLabels[shift] || shift,
          count: data.count,
          amount: data.amount,
        }));

        const abnormalByFreezer = freezers.map((f) => ({
          name: f.name,
          count: inspections.filter((i) => i.freezerId === f.id && i.isAbnormal).length,
        }));

        const monthMap = new Map<string, number>();
        approvedReports.forEach((report) => {
          const date = new Date(report.createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const current = monthMap.get(month) || 0;
          monthMap.set(month, current + report.totalAmount);
        });
        const lossByMonth = Array.from(monthMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, amount]) => ({ month, amount }));

        const totalAbnormal = inspections.filter((i) => i.isAbnormal).length;

        return {
          totalAbnormal,
          totalLossAmount,
          lossByCategory,
          lossByShift,
          abnormalByFreezer,
          lossByMonth,
        };
      },
    }),
    {
      name: 'loss-report-storage',
    }
  )
);

import { useInspectionStore } from './inspectionStore';
