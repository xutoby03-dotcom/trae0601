import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InspectionRecord, InspectionTask, InspectionItem, ItemStatus } from "../types";
import { generateInspectionRecords, generateInspectionTasks } from "../mock/inspections";
import { mockStations } from "../mock/stations";

const STATION_IDS = mockStations.map((s) => s.id);

interface InspectionState {
  records: InspectionRecord[];
  tasks: InspectionTask[];
  currentInspection: InspectionRecord | null;
  getRecordsByStation: (stationId: string) => InspectionRecord[];
  getRecordsByTask: (taskId: string) => InspectionRecord[];
  getAbnormalRecords: () => InspectionRecord[];
  getTaskById: (id: string) => InspectionTask | undefined;
  setCurrentInspection: (stationId: string, taskId: string, inspector: string) => void;
  updateInspectionItem: (item: InspectionItem, status: ItemStatus) => void;
  addAbnormalPhoto: (item: InspectionItem, photoUrl: string) => void;
  updateInspectionRemarks: (remarks: string) => void;
  submitInspection: () => InspectionRecord | null;
  completeTaskStation: (taskId: string) => void;
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      records: generateInspectionRecords(STATION_IDS),
      tasks: generateInspectionTasks(STATION_IDS),
      getRecordsByStation: (stationId) =>
        get()
          .records.filter((r) => r.stationId === stationId)
          .sort(
            (a, b) =>
              new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
          ),
      getRecordsByTask: (taskId) =>
        get().records.filter((r) => r.taskId === taskId),
      getAbnormalRecords: () =>
        get()
          .records.filter((r) => r.hasAbnormal)
          .sort(
            (a, b) =>
              new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
          ),
      getTaskById: (id) => get().tasks.find((t) => t.id === id),

      currentInspection: null,

      setCurrentInspection: (stationId, taskId, inspector) => {
        const items = {
          screen: "normal" as ItemStatus,
          socket: "normal" as ItemStatus,
          leakage: "normal" as ItemStatus,
          cable: "normal" as ItemStatus,
          qrcode: "normal" as ItemStatus,
          fireSpace: "normal" as ItemStatus,
          clutter: "normal" as ItemStatus,
        };
        set({
          currentInspection: {
            id: `temp_${Date.now()}`,
            taskId,
            stationId,
            inspector,
            inspectorId: `inspector_current`,
            inspectDate: new Date().toISOString(),
            items,
            abnormalPhotos: {},
            remarks: "",
            hasAbnormal: false,
          },
        });
      },

      updateInspectionItem: (item, status) => {
        const current = get().currentInspection;
        if (!current) return;
        const newItems = { ...current.items, [item]: status };
        const hasAbnormal = Object.values(newItems).some((v) => v === "abnormal");
        set({
          currentInspection: {
            ...current,
            items: newItems,
            hasAbnormal,
          },
        });
      },

      addAbnormalPhoto: (item, photoUrl) => {
        const current = get().currentInspection;
        if (!current) return;
        const existing = current.abnormalPhotos[item] || [];
        set({
          currentInspection: {
            ...current,
            abnormalPhotos: {
              ...current.abnormalPhotos,
              [item]: [...existing, photoUrl],
            },
          },
        });
      },

      updateInspectionRemarks: (remarks) => {
        const current = get().currentInspection;
        if (!current) return;
        set({
          currentInspection: { ...current, remarks },
        });
      },

      submitInspection: () => {
        const current = get().currentInspection;
        if (!current) return null;
        const newRecord: InspectionRecord = {
          ...current,
          id: `insp_rec_${Date.now()}`,
        };
        set((state) => ({
          records: [newRecord, ...state.records],
          currentInspection: null,
        }));
        return newRecord;
      },

      completeTaskStation: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const completedCount = Math.min(t.completedCount + 1, t.stationIds.length);
            return {
              ...t,
              completedCount,
              status:
                completedCount >= t.stationIds.length ? "completed" : "in_progress",
            };
          }),
        }));
      },
    }),
    {
      name: "inspection-data",
      partialize: (state) => ({ records: state.records, tasks: state.tasks }),
    }
  )
);
