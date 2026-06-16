import type { FoodStock } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_DATA } from "@/data/seedData";
import { uid, todayStr } from "@/utils/formatters";

const seed = SEED_DATA;

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
