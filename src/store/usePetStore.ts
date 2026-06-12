import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, Pet, VaccineRecord } from '../../shared/types';
import { mockPets, mockVaccineRecords } from '../data/mockData';
import { generateId } from '../utils/date';

interface PetStore {
  pets: Pet[];
  vaccineRecords: VaccineRecord[];
  filter: FilterState;
  setFilter: (patch: Partial<FilterState>) => void;
  resetFilter: () => void;
  addPet: (data: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (id: string, data: Partial<Pet>) => void;
  removePet: (id: string) => void;
  addVaccineRecord: (data: Omit<VaccineRecord, 'id' | 'createdAt'>) => void;
  updateVaccineRecord: (id: string, data: Partial<VaccineRecord>) => void;
  removeVaccineRecord: (id: string) => void;
  resetAll: () => void;
}

const defaultFilter: FilterState = {
  building: 'all',
  petType: 'all',
  status: 'all',
  keyword: '',
};

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: mockPets,
      vaccineRecords: mockVaccineRecords,
      filter: defaultFilter,

      setFilter: (patch) =>
        set((s) => ({ filter: { ...s.filter, ...patch } })),

      resetFilter: () => set({ filter: defaultFilter }),

      addPet: (data) =>
        set((s) => ({
          pets: [
            ...s.pets,
            {
              ...data,
              id: generateId(),
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        })),

      updatePet: (id, data) =>
        set((s) => ({
          pets: s.pets.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      removePet: (id) =>
        set((s) => ({
          pets: s.pets.filter((p) => p.id !== id),
          vaccineRecords: s.vaccineRecords.filter((r) => r.petId !== id),
        })),

      addVaccineRecord: (data) =>
        set((s) => ({
          vaccineRecords: [
            ...s.vaccineRecords,
            {
              ...data,
              id: generateId(),
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        })),

      updateVaccineRecord: (id, data) =>
        set((s) => ({
          vaccineRecords: s.vaccineRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      removeVaccineRecord: (id) =>
        set((s) => ({
          vaccineRecords: s.vaccineRecords.filter((r) => r.id !== id),
        })),

      resetAll: () =>
        set({
          pets: mockPets,
          vaccineRecords: mockVaccineRecords,
          filter: defaultFilter,
        }),
    }),
    {
      name: 'pet-immune-system-v1',
      partialize: (state) => ({
        pets: state.pets,
        vaccineRecords: state.vaccineRecords,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state || state.pets.length === 0) {
          state?.resetAll();
        }
      },
    }
  )
);

export function selectBuildings(pets: Pet[]): string[] {
  const set = new Set(pets.map((p) => p.building));
  return Array.from(set).sort();
}
