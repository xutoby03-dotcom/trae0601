import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cabinet } from '@/types';
import { mockCabinets } from '@/utils/mockData';

interface CabinetState {
  cabinets: Cabinet[];
  currentCabinet: Cabinet | null;
  initData: () => void;
  setCurrentCabinet: (cabinet: Cabinet | null) => void;
  getCabinetById: (id: string) => Cabinet | undefined;
}

export const useCabinetStore = create<CabinetState>()(
  persist(
    (set, get) => ({
      cabinets: [],
      currentCabinet: null,
      
      initData: () => {
        const { cabinets } = get();
        if (cabinets.length === 0) {
          set({ cabinets: mockCabinets });
        }
      },
      
      setCurrentCabinet: (cabinet) => set({ currentCabinet: cabinet }),
      
      getCabinetById: (id) => {
        return get().cabinets.find(c => c.id === id);
      },
    }),
    {
      name: 'cabinet-storage',
    }
  )
);
