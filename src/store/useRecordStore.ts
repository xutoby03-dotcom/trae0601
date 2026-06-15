import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsageRecord, SupplyRecord, LocationUsage, Cabinet } from '@/types';
import { mockUsageRecords, mockSupplyRecords, mockCabinets } from '@/utils/mockData';
import { generateId, isInjuryRelated } from '@/utils/statusUtils';
import { isWithinDays } from '@/utils/dateUtils';

interface RecordState {
  usageRecords: UsageRecord[];
  supplyRecords: SupplyRecord[];
  initData: () => void;
  addUsageRecord: (record: Omit<UsageRecord, 'id' | 'createdAt'>) => void;
  addSupplyRecord: (record: Omit<SupplyRecord, 'id' | 'createdAt'>) => void;
  getRecordsByCabinet: (cabinetId: string) => { usage: UsageRecord[]; supply: SupplyRecord[] };
  getWeeklyUsageCount: () => number;
  getInjuryHotspots: (days?: number) => LocationUsage[];
  getRecordsByMedicine: (medicineId: string) => { usage: UsageRecord[]; supply: SupplyRecord[] };
}

export const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      usageRecords: [],
      supplyRecords: [],
      
      initData: () => {
        const { usageRecords, supplyRecords } = get();
        if (usageRecords.length === 0) {
          set({ usageRecords: mockUsageRecords });
        }
        if (supplyRecords.length === 0) {
          set({ supplyRecords: mockSupplyRecords });
        }
      },
      
      addUsageRecord: (record) => {
        const newRecord: UsageRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          usageRecords: [newRecord, ...state.usageRecords],
        }));
      },
      
      addSupplyRecord: (record) => {
        const newRecord: SupplyRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          supplyRecords: [newRecord, ...state.supplyRecords],
        }));
      },
      
      getRecordsByCabinet: (cabinetId) => {
        const { usageRecords, supplyRecords } = get();
        return {
          usage: usageRecords.filter(r => r.cabinetId === cabinetId),
          supply: supplyRecords.filter(r => r.cabinetId === cabinetId),
        };
      },
      
      getWeeklyUsageCount: () => {
        const { usageRecords } = get();
        return usageRecords.filter(r => isWithinDays(r.createdAt, 7)).length;
      },
      
      getInjuryHotspots: (days = 7) => {
        const { usageRecords } = get();
        const cabinets: Cabinet[] = mockCabinets;
        const hotspotMap = new Map<string, LocationUsage>();
        
        usageRecords
          .filter(r => isWithinDays(r.createdAt, days) && isInjuryRelated(r.purpose))
          .forEach(r => {
            const cabinet = cabinets.find(c => c.id === r.cabinetId);
            if (!cabinet) return;
            
            const existing = hotspotMap.get(r.cabinetId);
            if (existing) {
              existing.count += r.quantity;
            } else {
              hotspotMap.set(r.cabinetId, {
                location: cabinet.name,
                cabinetId: r.cabinetId,
                count: r.quantity,
              });
            }
          });
        
        return Array.from(hotspotMap.values()).sort((a, b) => b.count - a.count);
      },
      
      getRecordsByMedicine: (medicineId) => {
        const { usageRecords, supplyRecords } = get();
        return {
          usage: usageRecords.filter(r => r.medicineId === medicineId),
          supply: supplyRecords.filter(r => r.medicineId === medicineId),
        };
      },
    }),
    {
      name: 'record-storage',
    }
  )
);
