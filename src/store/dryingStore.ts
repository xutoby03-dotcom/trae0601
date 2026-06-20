import { create } from "zustand";
import type { DryingRecord } from "@/types";
import { mockDryingRecords } from "@/data/mockData";
import { genId, nowIso } from "@/utils/time";

interface DryingStore {
  records: DryingRecord[];
  addRecord: (data: Omit<DryingRecord, "id" | "status">) => void;
  collectRecord: (
    id: string,
    data: { isDry: boolean; isDamp: boolean; needRewash: boolean; notes?: string }
  ) => void;
  deleteRecord: (id: string) => void;
  resetToMock: () => void;
}

export const useDryingStore = create<DryingStore>((set) => ({
  records: mockDryingRecords,

  addRecord: (data) =>
    set((state) => ({
      records: [
        {
          ...data,
          id: genId(),
          status: "drying",
        },
        ...state.records,
      ],
    })),

  collectRecord: (id, data) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id
          ? {
              ...r,
              status: data.needRewash ? "rewash" : "collected",
              collectedAt: nowIso(),
              isDry: data.isDry,
              isDamp: data.isDamp,
              needRewash: data.needRewash,
              notes: data.notes || r.notes,
            }
          : r
      ),
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    })),

  resetToMock: () => set({ records: mockDryingRecords }),
}));
