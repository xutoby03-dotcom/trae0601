import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoodItem, ThawHistory, FoodStatus, ThawMethod } from '@/types';
import { MOCK_FOODS, MOCK_THAW_HISTORY } from '@/data/mockData';

interface FoodState {
  foods: FoodItem[];
  thawHistory: ThawHistory[];
  selectedDrawer: string | null;
  addFood: (food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'thawCount'>) => void;
  updateFood: (id: string, updates: Partial<FoodItem>) => void;
  deleteFood: (id: string) => void;
  startThaw: (id: string, method: ThawMethod) => void;
  returnToFreeze: (id: string, note?: string) => void;
  markAsCooked: (id: string) => void;
  discardFood: (id: string) => void;
  setSelectedDrawer: (drawer: string | null) => void;
  getFoodById: (id: string) => FoodItem | undefined;
  getThawHistoryForFood: (foodId: string) => ThawHistory[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      foods: MOCK_FOODS,
      thawHistory: MOCK_THAW_HISTORY,
      selectedDrawer: null,

      addFood: (foodData) => {
        const now = new Date().toISOString();
        const newFood: FoodItem = {
          ...foodData,
          id: generateId(),
          status: 'frozen',
          thawCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          foods: [...state.foods, newFood],
        }));
      },

      updateFood: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          foods: state.foods.map((food) =>
            food.id === id ? { ...food, ...updates, updatedAt: now } : food
          ),
        }));
      },

      deleteFood: (id) => {
        set((state) => ({
          foods: state.foods.filter((food) => food.id !== id),
          thawHistory: state.thawHistory.filter((h) => h.foodItemId !== id),
        }));
      },

      startThaw: (id, method) => {
        const now = new Date().toISOString();
        set((state) => {
          const food = state.foods.find((f) => f.id === id);
          const newThawCount = (food?.thawCount || 0) + 1;
          return {
            foods: state.foods.map((f) =>
              f.id === id
                ? {
                    ...f,
                    status: 'thawing' as FoodStatus,
                    thawStartTime: now,
                    thawMethod: method,
                    thawCount: newThawCount,
                    updatedAt: now,
                  }
                : f
            ),
            thawHistory: [
              ...state.thawHistory,
              {
                id: generateId(),
                foodItemId: id,
                action: 'start_thaw',
                method,
                timestamp: now,
              },
            ],
          };
        });
      },

      returnToFreeze: (id, note) => {
        const now = new Date().toISOString();
        set((state) => ({
          foods: state.foods.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: 'frozen' as FoodStatus,
                  thawStartTime: undefined,
                  thawMethod: undefined,
                  updatedAt: now,
                }
              : f
          ),
          thawHistory: [
            ...state.thawHistory,
            {
              id: generateId(),
              foodItemId: id,
              action: 'return_freeze',
              timestamp: now,
              note,
            },
          ],
        }));
      },

      markAsCooked: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          foods: state.foods.map((f) =>
            f.id === id
              ? { ...f, status: 'cooked' as FoodStatus, updatedAt: now }
              : f
          ),
          thawHistory: [
            ...state.thawHistory,
            {
              id: generateId(),
              foodItemId: id,
              action: 'cook',
              timestamp: now,
            },
          ],
        }));
      },

      discardFood: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          foods: state.foods.map((f) =>
            f.id === id
              ? { ...f, status: 'frozen' as FoodStatus, updatedAt: now }
              : f
          ),
          thawHistory: [
            ...state.thawHistory,
            {
              id: generateId(),
              foodItemId: id,
              action: 'discard',
              timestamp: now,
            },
          ],
        }));
        get().deleteFood(id);
      },

      setSelectedDrawer: (drawer) => {
        set({ selectedDrawer: drawer });
      },

      getFoodById: (id) => {
        return get().foods.find((f) => f.id === id);
      },

      getThawHistoryForFood: (foodId) => {
        return get()
          .thawHistory.filter((h) => h.foodItemId === foodId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
    }),
    {
      name: 'food-storage',
      partialize: (state) => ({
        foods: state.foods,
        thawHistory: state.thawHistory,
      }),
    }
  )
);
