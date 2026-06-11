import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { FoodRecord, FoodStatus, ProcessType, FoodStats } from '@/types/food';
import { generateId, getRemainingDays, isExpired, isTonightCandidate, isExpiringSoon } from '@/utils/date';
import { mockFoodList } from '@/data/mockFood';

const STORAGE_KEY = 'food_records';

interface FoodStore {
  foods: FoodRecord[];
  init: () => void;
  addFood: (food: Omit<FoodRecord, 'id' | 'createdAt' | 'status'>) => void;
  processFood: (id: string, type: ProcessType, reason: string) => void;
  getFoodById: (id: string) => FoodRecord | undefined;
  getFoodsByStatus: (status: FoodStatus) => FoodRecord[];
  getStats: () => FoodStats;
  updateStatuses: () => void;
}

const determineStatus = (food: FoodRecord): FoodStatus => {
  if (food.processInfo) return 'processed';
  if (food.isFrozen) return 'frozen';
  if (isExpired(food.cookDate, food.expectedDays)) return 'expiring';
  if (isTonightCandidate(food.cookDate, food.expectedDays)) return 'tonight';
  if (isExpiringSoon(food.cookDate, food.expectedDays)) return 'expiring';
  return 'tonight';
};

const saveToStorage = (foods: FoodRecord[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, foods);
  } catch (e) {
    console.error('[FoodStore] saveToStorage error', e);
  }
};

const loadFromStorage = (): FoodRecord[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) return data;
  } catch (e) {
    console.error('[FoodStore] loadFromStorage error', e);
  }
  return mockFoodList;
};

export const useFoodStore = create<FoodStore>((set, get) => ({
  foods: [],

  init: () => {
    const stored = loadFromStorage();
    const updated = stored.map(food => ({
      ...food,
      status: determineStatus(food)
    }));
    set({ foods: updated });
    saveToStorage(updated);
    console.log('[FoodStore] initialized with', updated.length, 'records');
  },

  addFood: (foodData) => {
    const newFood: FoodRecord = {
      ...foodData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'tonight' as FoodStatus
    };
    newFood.status = determineStatus(newFood);
    const foods = [...get().foods, newFood];
    set({ foods });
    saveToStorage(foods);
    console.log('[FoodStore] added food:', newFood.name);
  },

  processFood: (id, type, reason) => {
    const foods = get().foods.map(food => {
      if (food.id === id) {
        return {
          ...food,
          status: 'processed' as FoodStatus,
          processInfo: {
            type,
            reason,
            date: new Date().toISOString()
          }
        };
      }
      return food;
    });
    set({ foods });
    saveToStorage(foods);
    console.log('[FoodStore] processed food:', id, type);
  },

  getFoodById: (id) => {
    return get().foods.find(f => f.id === id);
  },

  getFoodsByStatus: (status) => {
    return get().foods.filter(f => f.status === status);
  },

  updateStatuses: () => {
    const foods = get().foods.map(food => ({
      ...food,
      status: determineStatus(food)
    }));
    set({ foods });
    saveToStorage(foods);
  },

  getStats: () => {
    const foods = get().foods;
    const processed = foods.filter(f => f.processInfo);
    const discarded = processed.filter(f => f.processInfo?.type === 'discarded');
    const eaten = processed.filter(f => f.processInfo?.type === 'eaten');
    const transformed = processed.filter(f => f.processInfo?.type === 'transformed');

    const wasteMap = new Map<string, number>();
    discarded.forEach(f => {
      wasteMap.set(f.name, (wasteMap.get(f.name) || 0) + 1);
    });
    const mostWasted = Array.from(wasteMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    let totalStorageDays = 0;
    let storageCount = 0;
    processed.forEach(f => {
      if (f.processInfo) {
        const days = getRemainingDays(f.cookDate, f.expectedDays);
        const actualDays = f.expectedDays - days;
        totalStorageDays += actualDays;
        storageCount++;
      }
    });
    const avgStorageDays = storageCount > 0 ? Math.round((totalStorageDays / storageCount) * 10) / 10 : 0;

    const dateMap = new Map<string, number>();
    foods.forEach(f => {
      const date = f.cookDate;
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    const mostLeftoverDay = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      mostWasted,
      avgStorageDays,
      mostLeftoverDay,
      totalCount: foods.length,
      eatenCount: eaten.length,
      discardedCount: discarded.length,
      transformedCount: transformed.length
    };
  }
}));
