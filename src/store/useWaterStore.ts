import type { WaterChange, WaterTest } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_DATA } from "@/data/seedData";
import { uid } from "@/utils/formatters";

const seed = SEED_DATA;

interface WaterState {
  waterChanges: WaterChange[];
  waterTests: WaterTest[];
  addWaterChange: (data: Omit<WaterChange, "id">) => WaterChange;
  removeWaterChange: (id: string) => void;
  getWaterChanges: (aquarium_id?: string) => WaterChange[];
  addWaterTest: (data: Omit<WaterTest, "id">) => WaterTest;
  removeWaterTest: (id: string) => void;
  getWaterTests: (aquarium_id?: string) => WaterTest[];
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      waterChanges: seed.waterChanges,
      waterTests: seed.waterTests,
      addWaterChange: (data) => {
        const r: WaterChange = { ...data, id: uid() };
        set((s) => ({ waterChanges: [r, ...s.waterChanges] }));
        return r;
      },
      removeWaterChange: (id) =>
        set((s) => ({
          waterChanges: s.waterChanges.filter((x) => x.id !== id),
        })),
      getWaterChanges: (aquarium_id) => {
        const list = aquarium_id
          ? get().waterChanges.filter((x) => x.aquarium_id === aquarium_id)
          : get().waterChanges;
        return list.sort((a, b) => (a.date < b.date ? 1 : -1));
      },
      addWaterTest: (data) => {
        const r: WaterTest = { ...data, id: uid() };
        set((s) => ({ waterTests: [r, ...s.waterTests] }));
        return r;
      },
      removeWaterTest: (id) =>
        set((s) => ({ waterTests: s.waterTests.filter((x) => x.id !== id) })),
      getWaterTests: (aquarium_id) => {
        const list = aquarium_id
          ? get().waterTests.filter((x) => x.aquarium_id === aquarium_id)
          : get().waterTests;
        return list.sort((a, b) => (a.date < b.date ? 1 : -1));
      },
    }),
    {
      name: "water_data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
