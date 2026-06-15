import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FoodItem, ClaimRecord, DisposalRecord, StatsData } from '../types';
import { mockFoodItems, mockClaimRecords, mockDisposalRecords } from '../utils/mock';
import { generateId, getExpiryTime, isToday, isSafeToTakeToday } from '../utils/time';

interface FoodState {
  foods: FoodItem[];
  claimRecords: ClaimRecord[];
  disposalRecords: DisposalRecord[];
  currentUserName: string;
  currentUserDept: string;
  
  addFood: (food: Omit<FoodItem, 'id' | 'status' | 'createdAt' | 'remaining'>) => void;
  claimFood: (foodId: string, quantity: number, department: string, claimerName: string, pickupTime: string) => boolean;
  expireFood: (foodId: string, reason: 'expired' | 'unclaimed') => void;
  checkAndExpireFoods: () => void;
  getAvailableFoods: () => FoodItem[];
  getFoodById: (id: string) => FoodItem | undefined;
  getMyClaims: (name: string) => ClaimRecord[];
  getStats: () => StatsData;
  setCurrentUser: (name: string, dept: string) => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      foods: mockFoodItems,
      claimRecords: mockClaimRecords,
      disposalRecords: mockDisposalRecords,
      currentUserName: '测试用户',
      currentUserDept: '技术部',

      addFood: (foodData) => {
        const newFood: FoodItem = {
          ...foodData,
          id: generateId(),
          remaining: foodData.quantity,
          status: 'available',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          foods: [newFood, ...state.foods],
        }));
      },

      claimFood: (foodId, quantity, department, claimerName, pickupTime) => {
        const state = get();
        const food = state.foods.find((f) => f.id === foodId);
        
        if (!food || food.remaining < quantity || food.status === 'expired' || food.status === 'disposed') {
          return false;
        }

        const newRemaining = food.remaining - quantity;
        const newStatus = newRemaining === 0 ? 'fully_claimed' : 'partially_claimed';

        const claimRecord: ClaimRecord = {
          id: generateId(),
          foodId,
          foodName: food.name,
          department,
          quantity,
          pickupTime,
          claimerName,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          foods: state.foods.map((f) =>
            f.id === foodId
              ? { ...f, remaining: newRemaining, status: newStatus }
              : f
          ),
          claimRecords: [claimRecord, ...state.claimRecords],
        }));

        return true;
      },

      expireFood: (foodId, reason) => {
        const state = get();
        const food = state.foods.find((f) => f.id === foodId);
        
        if (!food || food.status === 'expired' || food.status === 'disposed') {
          return;
        }

        const disposalRecord: DisposalRecord = {
          id: generateId(),
          foodId,
          foodName: food.name,
          reason,
          quantity: food.remaining,
          disposedAt: new Date().toISOString(),
        };

        set((state) => ({
          foods: state.foods.map((f) =>
            f.id === foodId ? { ...f, status: 'disposed', remaining: 0 } : f
          ),
          disposalRecords: [disposalRecord, ...state.disposalRecords],
        }));
      },

      checkAndExpireFoods: () => {
        const state = get();
        const now = new Date();
        
        state.foods.forEach((food) => {
          if (food.status === 'available' || food.status === 'partially_claimed') {
            const expiryTime = getExpiryTime(food.endTime, food.edibleHours);
            if (expiryTime.getTime() < now.getTime()) {
              get().expireFood(food.id, 'expired');
            }
          }
        });
      },

      getAvailableFoods: () => {
        return get().foods.filter(
          (f) => f.status === 'available' || f.status === 'partially_claimed'
        );
      },

      getFoodById: (id) => {
        return get().foods.find((f) => f.id === id);
      },

      getMyClaims: (name) => {
        return get().claimRecords.filter((r) => r.claimerName === name);
      },

      getStats: () => {
        const state = get();
        const availableFoods = state.foods.filter(
          (f) => f.status === 'available' || f.status === 'partially_claimed'
        );
        
        const totalAvailable = availableFoods.reduce((sum, f) => sum + f.remaining, 0);
        
        const safeToTakeToday = availableFoods
          .filter((f) => isSafeToTakeToday(f.endTime, f.edibleHours))
          .reduce((sum, f) => sum + f.remaining, 0);

        const todayClaimed = state.claimRecords
          .filter((r) => isToday(r.createdAt))
          .reduce((sum, r) => sum + r.quantity, 0);

        const deptWasteMap = new Map<string, number>();
        state.disposalRecords.forEach((record) => {
          const food = state.foods.find((f) => f.id === record.foodId);
          const dept = food?.department || '未知部门';
          deptWasteMap.set(dept, (deptWasteMap.get(dept) || 0) + record.quantity);
        });
        
        const topWasteDepartments = Array.from(deptWasteMap.entries())
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const foodWasteMap = new Map<string, number>();
        state.disposalRecords.forEach((record) => {
          foodWasteMap.set(record.foodName, (foodWasteMap.get(record.foodName) || 0) + record.quantity);
        });
        
        const commonlyUnclaimed = Array.from(foodWasteMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          totalAvailable,
          safeToTakeToday,
          todayClaimed,
          topWasteDepartments,
          commonlyUnclaimed,
        };
      },

      setCurrentUser: (name, dept) => {
        set({ currentUserName: name, currentUserDept: dept });
      },
    }),
    {
      name: 'food-claim-storage',
    }
  )
);
