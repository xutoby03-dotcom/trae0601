import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Seasoning, UsageRecord, WasteRecord } from '@/types';
import { generateId, getTodayString, getSeasoningStatus, needsRestock } from '@/utils/seasoningUtils';
import { mockSeasonings, mockWasteRecords } from '@/data/mockData';

interface SeasoningState {
  seasonings: Seasoning[];
  usageRecords: UsageRecord[];
  wasteRecords: WasteRecord[];
  isInitialized: boolean;
  
  addSeasoning: (data: Omit<Seasoning, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateSeasoning: (id: string, data: Partial<Seasoning>) => void;
  deleteSeasoning: (id: string) => void;
  
  useSeasoning: (seasoningId: string, amount: number, note?: string) => void;
  
  markAsRestocked: (seasoningId: string, newAmount: number) => void;
  markAsWasted: (seasoningId: string, reason: string) => void;
  
  getSeasoningById: (id: string) => Seasoning | undefined;
  initMockData: () => void;
}

export const useSeasoningStore = create<SeasoningState>()(
  persist(
    (set, get) => ({
      seasonings: [],
      usageRecords: [],
      wasteRecords: [],
      isInitialized: false,

      initMockData: () => {
        if (get().isInitialized) return;
        set({
          seasonings: [...mockSeasonings],
          wasteRecords: [...mockWasteRecords],
          isInitialized: true,
        });
      },

      addSeasoning: (data) => {
        const now = new Date().toISOString();
        const newSeasoning: Seasoning = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          status: 'active',
        };
        set((state) => ({
          seasonings: [...state.seasonings, newSeasoning],
        }));
      },

      updateSeasoning: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          seasonings: state.seasonings.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: now } : s
          ),
        }));
      },

      deleteSeasoning: (id) => {
        set((state) => ({
          seasonings: state.seasonings.filter((s) => s.id !== id),
        }));
      },

      useSeasoning: (seasoningId, amount, note) => {
        const state = get();
        const seasoning = state.seasonings.find((s) => s.id === seasoningId);
        if (!seasoning) return;

        const newAmount = Math.max(0, seasoning.currentAmount - amount);
        
        const record: UsageRecord = {
          id: generateId(),
          seasoningId,
          amount,
          date: getTodayString(),
          note,
        };

        set((prev) => ({
          seasonings: prev.seasonings.map((s) =>
            s.id === seasoningId
              ? { ...s, currentAmount: newAmount, updatedAt: new Date().toISOString() }
              : s
          ),
          usageRecords: [...prev.usageRecords, record],
        }));
      },

      markAsRestocked: (seasoningId, newAmount) => {
        const now = new Date().toISOString();
        set((state) => ({
          seasonings: state.seasonings.map((s) =>
            s.id === seasoningId
              ? {
                  ...s,
                  initialAmount: newAmount,
                  currentAmount: newAmount,
                  openDate: getTodayString(),
                  updatedAt: now,
                  status: 'active',
                }
              : s
          ),
        }));
      },

      markAsWasted: (seasoningId, reason) => {
        const state = get();
        const seasoning = state.seasonings.find((s) => s.id === seasoningId);
        if (!seasoning) return;

        const wasteRecord: WasteRecord = {
          id: generateId(),
          seasoningId,
          seasoningName: seasoning.name,
          seasoningBrand: seasoning.brand,
          category: seasoning.category,
          wastedAmount: seasoning.currentAmount,
          unit: seasoning.unit,
          reason,
          date: getTodayString(),
          price: seasoning.price,
        };

        set((prev) => ({
          seasonings: prev.seasonings.filter((s) => s.id !== seasoningId),
          wasteRecords: [...prev.wasteRecords, wasteRecord],
        }));
      },

      getSeasoningById: (id) => {
        return get().seasonings.find((s) => s.id === id);
      },
    }),
    {
      name: 'seasoning-storage',
    }
  )
);

export function getFilteredSeasonings(filter: string) {
  const { seasonings } = useSeasoningStore.getState();
  
  return seasonings
    .filter((s) => {
      if (s.status !== 'active') return false;
      
      const status = getSeasoningStatus(s);
      const restock = needsRestock(s);
      
      switch (filter) {
        case 'all':
          return status !== 'expired';
        case 'fresh':
          return status === 'fresh' && !restock;
        case 'soon':
          return status === 'soon';
        case 'expired':
          return status === 'expired';
        case 'restock':
          return restock && status !== 'expired';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aDays = (() => {
        const expiryDate = new Date(a.openDate);
        expiryDate.setDate(expiryDate.getDate() + a.shelfLifeDays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        return Math.ceil((expiryDate.getTime() - today.getTime()) / 86400000);
      })();
      const bDays = (() => {
        const expiryDate = new Date(b.openDate);
        expiryDate.setDate(expiryDate.getDate() + b.shelfLifeDays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        return Math.ceil((expiryDate.getTime() - today.getTime()) / 86400000);
      })();
      return aDays - bDays;
    });
}
