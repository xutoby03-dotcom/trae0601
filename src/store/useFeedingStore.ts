import type {
  FeedingPlan,
  FeedingRecord,
  FeedingPeriod,
  LeftoverLevel,
  FishStatus,
} from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_DATA, buildDailyPlanForAquarium } from "@/data/seedData";
import { uid, nowStr, todayStr } from "@/utils/formatters";
import { useAquariumStore } from "./useAquariumStore";
import { useStockStore } from "./useStockStore";

const seed = SEED_DATA;

interface FeedingState {
  plans: FeedingPlan[];
  records: FeedingRecord[];
  ensurePlanForDate: (aquarium_id: string, date: string) => FeedingPlan;
  ensureTodayPlansForAll: () => void;
  getPlanForDate: (
    aquarium_id: string,
    date: string
  ) => FeedingPlan | undefined;
  addRecord: (payload: {
    aquarium_id: string;
    period: FeedingPeriod;
    feeder: string;
    actual_grams: number;
    leftover_level: LeftoverLevel;
    fish_status: FishStatus;
    notes?: string;
  }) => { record: FeedingRecord; duplicate: boolean };
  getRecordsForDate: (aquarium_id: string, date: string) => FeedingRecord[];
  getAllRecords: (aquarium_id?: string) => FeedingRecord[];
  undoRecord: (id: string) => void;
}

export const useFeedingStore = create<FeedingState>()(
  persist(
    (set, get) => ({
      plans: seed.plans,
      records: seed.records,
      ensurePlanForDate: (aquarium_id, date) => {
        const existing = get().plans.find(
          (p) => p.aquarium_id === aquarium_id && p.date === date
        );
        if (existing) return existing;
        const a = useAquariumStore.getState().getAquarium(aquarium_id);
        const plan: FeedingPlan = a
          ? buildDailyPlanForAquarium(a, date)
          : {
              id: uid(),
              aquarium_id,
              date,
              morning_grams: 0,
              evening_grams: 0,
              morning_done: false,
              evening_done: false,
            };
        set((s) => ({ plans: [...s.plans, plan] }));
        return plan;
      },
      ensureTodayPlansForAll: () => {
        const list = useAquariumStore.getState().aquariums;
        const today = todayStr();
        list.forEach((a) => get().ensurePlanForDate(a.id, today));
      },
      getPlanForDate: (aquarium_id, date) =>
        get().plans.find(
          (p) => p.aquarium_id === aquarium_id && p.date === date
        ),
      addRecord: ({
        aquarium_id,
        period,
        feeder,
        actual_grams,
        leftover_level,
        fish_status,
        notes,
      }) => {
        const today = todayStr();
        const state = get();
        const existingToday = state.records.filter(
          (r) =>
            r.aquarium_id === aquarium_id &&
            r.datetime.startsWith(today) &&
            r.period === period
        );
        const duplicate = existingToday.length > 0;
        const record: FeedingRecord = {
          id: uid(),
          aquarium_id,
          datetime: nowStr(),
          period,
          feeder,
          actual_grams,
          leftover_level,
          fish_status,
          notes,
        };
        set((s) => ({ records: [record, ...s.records] }));
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.aquarium_id === aquarium_id && p.date === today) {
              return period === "morning"
                ? { ...p, morning_done: true }
                : { ...p, evening_done: true };
            }
            return p;
          }),
        }));
        const a = useAquariumStore.getState().getAquarium(aquarium_id);
        if (a) {
          try {
            useStockStore.getState().consumeStockByType(a.food_type, actual_grams);
          } catch {
            /* ignore */
          }
        }
        return { record, duplicate };
      },
      getRecordsForDate: (aquarium_id, date) =>
        get()
          .records.filter(
            (r) => r.aquarium_id === aquarium_id && r.datetime.startsWith(date)
          )
          .sort((a, b) => (a.datetime < b.datetime ? 1 : -1)),
      getAllRecords: (aquarium_id) => {
        const list = aquarium_id
          ? get().records.filter((r) => r.aquarium_id === aquarium_id)
          : get().records;
        return list.sort((a, b) => (a.datetime < b.datetime ? 1 : -1));
      },
      undoRecord: (id) => {
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
      },
    }),
    {
      name: "feeding_data",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => state?.ensureTodayPlansForAll(), 0);
      },
    }
  )
);
