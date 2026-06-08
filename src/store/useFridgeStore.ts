import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FoodItem, ShoppingItem, WasteRecord, FoodCategory } from "@/types";
import { DEMO_FOOD_ITEMS, DEMO_SHOPPING_ITEMS, DEMO_WASTE_RECORDS } from "@/data/demoData";
import { getExpiryStatus } from "@/utils/expiry";

interface FridgeState {
  foodItems: FoodItem[];
  shoppingList: ShoppingItem[];
  wasteRecords: WasteRecord[];
  scannerOpen: boolean;

  addFoodItem: (item: Omit<FoodItem, "id" | "consumed">) => void;
  consumeFood: (id: string, amount?: number) => void;
  removeFoodItem: (id: string) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;

  addShoppingItem: (item: Omit<ShoppingItem, "id" | "purchased" | "addedDate">) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  purchaseShoppingItem: (id: string) => void;

  addWasteRecord: (record: Omit<WasteRecord, "id">) => void;

  setScannerOpen: (open: boolean) => void;

  getExpiringItems: () => FoodItem[];
  getItemsByLocation: (location: FoodItem["storageLocation"]) => FoodItem[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export const useFridgeStore = create<FridgeState>()(
  persist(
    (set, get) => ({
      foodItems: DEMO_FOOD_ITEMS,
      shoppingList: DEMO_SHOPPING_ITEMS,
      wasteRecords: DEMO_WASTE_RECORDS,
      scannerOpen: false,

      addFoodItem: (item) => {
        const newItem: FoodItem = {
          ...item,
          id: generateId(),
          consumed: false,
        };
        set((state) => ({ foodItems: [...state.foodItems, newItem] }));
      },

      consumeFood: (id, amount = 1) => {
        set((state) => {
          const item = state.foodItems.find((f) => f.id === id);
          if (!item) return state;

          const newQuantity = Math.max(0, item.quantity - amount);
          const updates: Partial<FoodItem> = { quantity: newQuantity };

          if (newQuantity === 0) {
            updates.consumed = true;
            updates.consumedDate = new Date().toISOString().split("T")[0];
          }

          const newFoodItems = state.foodItems.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          );

          const shouldAddToShopping = (newQuantity > 0 && newQuantity <= item.lowThreshold) || newQuantity === 0;
          const alreadyInList = state.shoppingList.some(
            (s) => s.name === item.name && !s.purchased
          );

          let newShoppingList = state.shoppingList;
          if (shouldAddToShopping && !alreadyInList) {
            newShoppingList = [
              ...state.shoppingList,
              {
                id: generateId(),
                name: item.name,
                category: item.category,
                targetQuantity: newQuantity === 0 ? item.lowThreshold * 2 : item.lowThreshold * 2 - newQuantity,
                unit: item.unit,
                purchased: false,
                addedDate: new Date().toISOString().split("T")[0],
              },
            ];
          }

          return { foodItems: newFoodItems, shoppingList: newShoppingList };
        });
      },

      removeFoodItem: (id) => {
        set((state) => {
          const item = state.foodItems.find((f) => f.id === id);
          if (!item) return state;

          const status = getExpiryStatus(item.purchaseDate, item.shelfLifeDays);
          const isExpired = status === "expired" || status === "expiring";

          const newWasteRecords = isExpired
            ? [
                ...state.wasteRecords,
                {
                  id: generateId(),
                  foodItemId: item.id,
                  name: item.name,
                  category: item.category,
                  quantity: item.quantity,
                  unit: item.unit,
                  wasteDate: new Date().toISOString().split("T")[0],
                  reason: (status === "expired" ? "expired" : "spoiled") as WasteRecord["reason"],
                },
              ]
            : state.wasteRecords;

          return {
            foodItems: state.foodItems.filter((f) => f.id !== id),
            wasteRecords: newWasteRecords,
          };
        });
      },

      updateFoodItem: (id, updates) => {
        set((state) => ({
          foodItems: state.foodItems.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },

      addShoppingItem: (item) => {
        const newItem: ShoppingItem = {
          ...item,
          id: generateId(),
          purchased: false,
          addedDate: new Date().toISOString().split("T")[0],
        };
        set((state) => ({ shoppingList: [...state.shoppingList, newItem] }));
      },

      toggleShoppingItem: (id) => {
        set((state) => ({
          shoppingList: state.shoppingList.map((s) =>
            s.id === id ? { ...s, purchased: !s.purchased } : s
          ),
        }));
      },

      removeShoppingItem: (id) => {
        set((state) => ({
          shoppingList: state.shoppingList.filter((s) => s.id !== id),
        }));
      },

      purchaseShoppingItem: (id) => {
        const state = get();
        const item = state.shoppingList.find((s) => s.id === id);
        if (!item) return;

        const newFoodItem: FoodItem = {
          id: generateId(),
          name: item.name,
          category: item.category,
          quantity: item.targetQuantity,
          unit: item.unit as FoodItem["unit"],
          purchaseDate: new Date().toISOString().split("T")[0],
          shelfLifeDays: 7,
          storageLocation: "fridge",
          icon: "📦",
          lowThreshold: 1,
          consumed: false,
        };

        set((state) => ({
          foodItems: [...state.foodItems, newFoodItem],
          shoppingList: state.shoppingList.filter((s) => s.id !== id),
        }));
      },

      addWasteRecord: (record) => {
        const newRecord: WasteRecord = { ...record, id: generateId() };
        set((state) => ({ wasteRecords: [...state.wasteRecords, newRecord] }));
      },

      setScannerOpen: (open) => set({ scannerOpen: open }),

      getExpiringItems: () => {
        return get().foodItems.filter((f) => {
          if (f.consumed) return false;
          const status = getExpiryStatus(f.purchaseDate, f.shelfLifeDays);
          return status === "expired" || status === "expiring";
        });
      },

      getItemsByLocation: (location) => {
        return get().foodItems.filter(
          (f) => !f.consumed && f.storageLocation === location
        );
      },
    }),
    {
      name: "fridge-inventory-storage",
    }
  )
);
