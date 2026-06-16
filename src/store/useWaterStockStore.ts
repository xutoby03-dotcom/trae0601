import type { WaterChange, WaterTest, FoodStock } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { buildSeedData } from "@/data/seedData";
import { uid, todayStr } from "@/utils/formatters";

const seed = buildSeedData();

interface WaterState {
  waterChanges: WaterChange[];
  waterTests: WaterTest[];
  addWaterChange: (
    data: Omit<WaterChange, "id">
  ) => WaterChange;
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

interface StockState {
  stocks: FoodStock[];
  addStock: (data: Omit<FoodStock, "id">) => FoodStock;
  updateStock: (id: string, data: Partial<FoodStock>) => void;
  removeStock: (id: string) => void;
  consumeStockByType: (food_type: string, grams: number) => void;
  addStockQuantity: (id: string, grams: number) => void;
  getStockByType: (food_type: string) => FoodStock | undefined;
}

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      stocks: seed.stocks,
      addStock: (data) => {
        const r: FoodStock = { ...data, id: uid() };
        set((s) => ({ stocks: [...s.stocks, r] }));
        return r;
      },
      updateStock: (id, data) =>
        set((s) => ({
          stocks: s.stocks.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      removeStock: (id) =>
        set((s) => ({ stocks: s.stocks.filter((x) => x.id !== id) })),
      consumeStockByType: (food_type, grams) =>
        set((s) => ({
          stocks: s.stocks.map((x) =>
            x.food_type === food_type
              ? { ...x, current_grams: Math.max(0, x.current_grams - grams) }
              : x
          ),
        })),
      addStockQuantity: (id, grams) =>
        set((s) => ({
          stocks: s.stocks.map((x) =>
            x.id === id
              ? {
                  ...x,
                  current_grams: x.current_grams + grams,
                  last_purchase_date: todayStr(),
                }
              : x
          ),
        })),
      getStockByType: (food_type) =>
        get().stocks.find((x) => x.food_type === food_type),
    }),
    {
      name: "stock_data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
