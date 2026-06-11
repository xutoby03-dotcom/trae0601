import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, RentalRecord, SwapRecord, Person, EquipmentStatus } from '../types';
import { mockEquipments, mockRentalRecords, mockSwapRecords, mockPersons } from '../utils/mockData';

interface RentalStore {
  equipments: Equipment[];
  rentalRecords: RentalRecord[];
  swapRecords: SwapRecord[];
  persons: Person[];
  
  addEquipment: (equipment: Omit<Equipment, 'id' | 'status'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  
  createRental: (rental: Omit<RentalRecord, 'id' | 'status' | 'isReturned' | 'isDamaged' | 'depositDeducted' | 'createdAt'>) => void;
  returnEquipment: (rentalId: string, data: { isDamaged: boolean; depositDeducted: boolean; depositDeductionAmount?: number; returnNote?: string }) => void;
  swapEquipment: (fromRentalId: string, toEquipmentId: string, reason: string) => void;
  
  addPerson: (name: string) => void;
  removePerson: (id: string) => void;
  
  resetData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useRentalStore = create<RentalStore>()(
  persist(
    (set, get) => ({
      equipments: mockEquipments,
      rentalRecords: mockRentalRecords,
      swapRecords: mockSwapRecords,
      persons: mockPersons,

      addEquipment: (equipment) => {
        const newEquipment: Equipment = {
          ...equipment,
          id: generateId(),
          status: 'available',
        };
        set((state) => ({
          equipments: [...state.equipments, newEquipment],
        }));
      },

      updateEquipment: (id, updates) => {
        set((state) => ({
          equipments: state.equipments.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      deleteEquipment: (id) => {
        set((state) => ({
          equipments: state.equipments.filter((e) => e.id !== id),
        }));
      },

      createRental: (rental) => {
        const newRental: RentalRecord = {
          ...rental,
          id: generateId(),
          status: 'active',
          isReturned: false,
          isDamaged: false,
          depositDeducted: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          rentalRecords: [...state.rentalRecords, newRental],
          equipments: state.equipments.map((e) =>
            e.id === rental.equipmentId ? { ...e, status: 'rented' as EquipmentStatus } : e
          ),
        }));
      },

      returnEquipment: (rentalId, data) => {
        const rental = get().rentalRecords.find((r) => r.id === rentalId);
        if (!rental) return;

        set((state) => ({
          rentalRecords: state.rentalRecords.map((r) =>
            r.id === rentalId
              ? {
                  ...r,
                  status: 'returned',
                  isReturned: true,
                  isDamaged: data.isDamaged,
                  depositDeducted: data.depositDeducted,
                  depositDeductionAmount: data.depositDeductionAmount,
                  returnNote: data.returnNote,
                  returnedAt: new Date().toISOString(),
                }
              : r
          ),
          equipments: state.equipments.map((e) =>
            e.id === rental.equipmentId ? { ...e, status: 'returned' as EquipmentStatus } : e
          ),
        }));
      },

      swapEquipment: (fromRentalId, toEquipmentId, reason) => {
        const fromRental = get().rentalRecords.find((r) => r.id === fromRentalId);
        if (!fromRental) return;

        const swapRecord: SwapRecord = {
          id: generateId(),
          fromEquipmentId: fromRental.equipmentId,
          toEquipmentId,
          userName: fromRental.userName,
          reason,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          swapRecords: [...state.swapRecords, swapRecord],
          rentalRecords: state.rentalRecords.map((r) =>
            r.id === fromRentalId ? { ...r, equipmentId: toEquipmentId } : r
          ),
          equipments: state.equipments.map((e) => {
            if (e.id === fromRental.equipmentId) return { ...e, status: 'available' as EquipmentStatus };
            if (e.id === toEquipmentId) return { ...e, status: 'rented' as EquipmentStatus };
            return e;
          }),
        }));
      },

      addPerson: (name) => {
        const newPerson: Person = {
          id: generateId(),
          name,
        };
        set((state) => ({
          persons: [...state.persons, newPerson],
        }));
      },

      removePerson: (id) => {
        set((state) => ({
          persons: state.persons.filter((p) => p.id !== id),
        }));
      },

      resetData: () => {
        set({
          equipments: mockEquipments,
          rentalRecords: mockRentalRecords,
          swapRecords: mockSwapRecords,
          persons: mockPersons,
        });
      },
    }),
    {
      name: 'ski-rental-storage',
    }
  )
);
