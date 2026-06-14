import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Facility, FacilityStatus } from '@/types';

const generateId = (): string => Date.now().toString() + Math.random().toString(36).slice(2, 9);

interface FacilityState {
  facilities: Facility[];
  addFacility: (data: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) => void;
  updateFacility: (id: string, data: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  setFacilityStatus: (id: string, status: FacilityStatus) => void;
  getFacilityById: (id: string) => Facility | undefined;
}

export const useFacilityStore = create<FacilityState>()(
  persist(
    (set, get) => ({
      facilities: [],
      addFacility: (data) => {
        const now = new Date().toISOString();
        const newFacility: Facility = {
          ...data,
          id: generateId(),
          created_at: now,
          updated_at: now,
        };
        set({ facilities: [...get().facilities, newFacility] });
      },
      updateFacility: (id, data) => {
        const now = new Date().toISOString();
        set({
          facilities: get().facilities.map((f) =>
            f.id === id ? { ...f, ...data, updated_at: now } : f
          ),
        });
      },
      deleteFacility: (id) => {
        set({ facilities: get().facilities.filter((f) => f.id !== id) });
      },
      setFacilityStatus: (id, status) => {
        const now = new Date().toISOString();
        set({
          facilities: get().facilities.map((f) =>
            f.id === id ? { ...f, status, updated_at: now } : f
          ),
        });
      },
      getFacilityById: (id) => {
        return get().facilities.find((f) => f.id === id);
      },
    }),
    {
      name: 'playground-facilities',
    }
  )
);
