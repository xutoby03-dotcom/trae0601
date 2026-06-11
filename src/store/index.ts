import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Report, Indicator, FollowUp, Advice, Severity } from "@/types";
import { addDays, generateId, todayStr } from "@/utils/date";
import { mockReports, mockIndicators, mockFollowUps, mockAdvices } from "@/utils/mockData";

interface HealthStore {
  reports: Report[];
  indicators: Indicator[];
  followUps: FollowUp[];
  advices: Advice[];

  addReport: (data: Omit<Report, "id" | "createdAt">) => string;
  deleteReport: (id: string) => void;

  addIndicator: (
    data: Omit<Indicator, "id" | "createdAt" | "nextFollowUpDate"> & {
      examDate: string;
    }
  ) => string;
  updateIndicatorSeverity: (id: string, severity: Severity) => void;

  addFollowUp: (data: Omit<FollowUp, "id" | "createdAt">) => string;

  addAdvice: (data: Omit<Advice, "id" | "createdAt" | "completed">) => string;
  toggleAdvice: (id: string) => void;
  deleteAdvice: (id: string) => void;

  initMockData: () => void;
}

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      reports: [],
      indicators: [],
      followUps: [],
      advices: [],

      initMockData: () => {
        set({
          reports: mockReports,
          indicators: mockIndicators,
          followUps: mockFollowUps,
          advices: mockAdvices,
        });
      },

      addReport: (data) => {
        const id = generateId();
        const report: Report = {
          ...data,
          id,
          createdAt: todayStr(),
        };
        set((state) => ({ reports: [report, ...state.reports] }));
        return id;
      },

      deleteReport: (id) => {
        set((state) => {
          const indicatorIds = state.indicators
            .filter((i) => i.reportId === id)
            .map((i) => i.id);
          return {
            reports: state.reports.filter((r) => r.id !== id),
            indicators: state.indicators.filter((i) => i.reportId !== id),
            followUps: state.followUps.filter((f) => !indicatorIds.includes(f.indicatorId)),
            advices: state.advices.filter((a) => !indicatorIds.includes(a.indicatorId)),
          };
        });
      },

      addIndicator: (data) => {
        const id = generateId();
        const indicator: Indicator = {
          id,
          reportId: data.reportId,
          name: data.name,
          value: data.value,
          unit: data.unit,
          referenceRange: data.referenceRange,
          severity: data.severity,
          doctorAdvice: data.doctorAdvice,
          followUpCycleDays: data.followUpCycleDays,
          nextFollowUpDate: addDays(data.examDate, data.followUpCycleDays),
          createdAt: todayStr(),
        };
        set((state) => ({ indicators: [...state.indicators, indicator] }));
        return id;
      },

      updateIndicatorSeverity: (id, severity) => {
        set((state) => ({
          indicators: state.indicators.map((i) =>
            i.id === id ? { ...i, severity } : i
          ),
        }));
      },

      addFollowUp: (data) => {
        const id = generateId();
        const followUp: FollowUp = {
          ...data,
          id,
          createdAt: todayStr(),
        };
        set((state) => {
          const indicator = state.indicators.find((i) => i.id === data.indicatorId);
          let indicators = state.indicators;
          if (indicator) {
            indicators = state.indicators.map((i) =>
              i.id === data.indicatorId
                ? {
                    ...i,
                    nextFollowUpDate: addDays(data.date, i.followUpCycleDays),
                  }
                : i
            );
          }
          return {
            followUps: [...state.followUps, followUp],
            indicators,
          };
        });
        return id;
      },

      addAdvice: (data) => {
        const id = generateId();
        const advice: Advice = {
          ...data,
          id,
          completed: false,
          createdAt: todayStr(),
        };
        set((state) => ({ advices: [...state.advices, advice] }));
        return id;
      },

      toggleAdvice: (id) => {
        set((state) => ({
          advices: state.advices.map((a) =>
            a.id === id ? { ...a, completed: !a.completed } : a
          ),
        }));
      },

      deleteAdvice: (id) => {
        set((state) => ({
          advices: state.advices.filter((a) => a.id !== id),
        }));
      },
    }),
    {
      name: "health-checkup-storage",
    }
  )
);
