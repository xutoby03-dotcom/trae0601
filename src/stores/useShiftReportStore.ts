import { create } from 'zustand';
import type { ShiftReport } from '../types';
import { mockShiftReports } from '../data/mockData';

interface ShiftReportState {
  reports: ShiftReport[];
  addReport: (report: Omit<ShiftReport, 'id' | 'createdAt'>) => void;
}

export const useShiftReportStore = create<ShiftReportState>((set) => ({
  reports: mockShiftReports,

  addReport: (report) =>
    set((state) => ({
      reports: [
        {
          ...report,
          id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: Date.now(),
        },
        ...state.reports,
      ],
    })),
}));
