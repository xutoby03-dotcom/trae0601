import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pot, CookingRecord, ProductionBatch, Complaint, TasteResult, ItemName } from '../types';
import { mockPots } from '../data/mockData';

interface PotState {
  pots: Pot[];
  selectedPotId: string | null;
  currentOperator: string;
}

interface PotActions {
  setSelectedPotId: (id: string | null) => void;
  addCookingRecord: (potId: string, record: Omit<CookingRecord, 'id' | 'potId' | 'timestamp'>) => void;
  addProductionBatch: (potId: string, batch: Omit<ProductionBatch, 'id' | 'potId'>) => void;
  addComplaint: (batchId: string, complaint: Omit<Complaint, 'id' | 'batchId' | 'potId' | 'timestamp'>) => void;
  getPotById: (id: string) => Pot | undefined;
  getAlertPots: () => Pot[];
  getMonthlySpiceMap: (year?: number, month?: number) => Record<string, number>;
  updatePotStatus: (potId: string) => void;
  resetToMockData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const calculatePotStatus = (pot: Pot): 'normal' | 'warning' | 'danger' => {
  let status: 'normal' | 'warning' | 'danger' = 'normal';

  if (pot.soupLevel < 30) {
    status = 'danger';
  } else if (pot.soupLevel < 50) {
    status = 'warning';
  }

  if (pot.continuousUseHours >= 72) {
    status = 'danger';
  } else if (pot.continuousUseHours >= 48 && status !== 'danger') {
    status = 'warning';
  }

  const recentComplaints = pot.complaints.filter(c => {
    const complaintTime = new Date(c.timestamp).getTime();
    const now = Date.now();
    return now - complaintTime < 24 * 60 * 60 * 1000;
  });
  if (recentComplaints.length >= 2) {
    status = 'danger';
  }

  return status;
};

export const usePotStore = create<PotState & PotActions>()(
  persist(
    (set, get) => ({
      pots: mockPots,
      selectedPotId: null,
      currentOperator: '张师傅',

      setSelectedPotId: (id) => set({ selectedPotId: id }),

      addCookingRecord: (potId, record) => set((state) => {
        const newRecord: CookingRecord = {
          ...record,
          id: generateId(),
          potId,
          timestamp: new Date().toISOString(),
        };

        const updatedPots = state.pots.map((pot) => {
          if (pot.id !== potId) return pot;

          const newSoupLevel = Math.min(100, pot.soupLevel + (record.waterAmount + record.stockAmount) / 100);
          let newSalinity = pot.salinity;
          if (record.saltAmount > 30) newSalinity = 'high';
          else if (record.saltAmount < 15) newSalinity = 'low';

          const newSpicePackCount = pot.spicePackCount + record.spicePackCount;

          const updatedPot = {
            ...pot,
            soupLevel: newSoupLevel,
            salinity: newSalinity,
            spicePackCount: newSpicePackCount,
            needSkim: false,
            cookingRecords: [newRecord, ...pot.cookingRecords],
          };

          return {
            ...updatedPot,
            status: calculatePotStatus(updatedPot),
          };
        });

        return { pots: updatedPots };
      }),

      addProductionBatch: (potId, batch) => set((state) => {
        const newBatch: ProductionBatch = {
          ...batch,
          id: generateId(),
          potId,
        };

        const updatedPots = state.pots.map((pot) => {
          if (pot.id !== potId) return pot;

          const newTodayItems = pot.todayItems.includes(batch.itemName)
            ? pot.todayItems
            : [...pot.todayItems, batch.itemName];

          const newSoupLevel = Math.max(0, pot.soupLevel - batch.quantity * 0.5);

          const updatedPot = {
            ...pot,
            todayItems: newTodayItems,
            soupLevel: newSoupLevel,
            productionBatches: [newBatch, ...pot.productionBatches],
          };

          return {
            ...updatedPot,
            status: calculatePotStatus(updatedPot),
          };
        });

        return { pots: updatedPots };
      }),

      addComplaint: (batchId, complaint) => set((state) => {
        const batch = state.pots
          .flatMap((p) => p.productionBatches)
          .find((b) => b.id === batchId);

        if (!batch) return state;

        const newComplaint: Complaint = {
          ...complaint,
          id: generateId(),
          batchId,
          potId: batch.potId,
          timestamp: new Date().toISOString(),
        };

        const updatedPots = state.pots.map((pot) => {
          if (pot.id !== batch.potId) return pot;

          const updatedBatches = pot.productionBatches.map((b) =>
            b.id === batchId ? { ...b, hasComplaint: true } : b
          );

          const updatedPot = {
            ...pot,
            productionBatches: updatedBatches,
            complaints: [newComplaint, ...pot.complaints],
          };

          return {
            ...updatedPot,
            status: calculatePotStatus(updatedPot),
          };
        });

        return { pots: updatedPots };
      }),

      getPotById: (id) => get().pots.find((p) => p.id === id),

      getAlertPots: () => get().pots.filter((p) => p.status !== 'normal'),

      getMonthlySpiceMap: (year, month) => {
        const now = new Date();
        const targetYear = year ?? now.getFullYear();
        const targetMonth = month ?? now.getMonth();
        const map: Record<string, number> = {};
        get().pots.forEach((pot) => {
          let count = 0;
          pot.cookingRecords.forEach((record) => {
            const d = new Date(record.timestamp);
            if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
              count += record.spicePackCount;
            }
          });
          map[pot.id] = count;
        });
        return map;
      },

      updatePotStatus: (potId) => set((state) => ({
        pots: state.pots.map((pot) =>
          pot.id === potId
            ? { ...pot, status: calculatePotStatus(pot) }
            : pot
        ),
      })),

      resetToMockData: () => set({ pots: mockPots }),
    }),
    {
      name: 'pot-ledger-storage',
    }
  )
);
