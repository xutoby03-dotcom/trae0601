import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  FamilyMember,
  Medicine,
  Trip,
  TripItem,
  TripStatus,
  ConsumptionLog,
} from '@/types';
import { generateId } from '@/utils/date';
import { mockFamilyMembers, mockMedicines, mockTrips, mockTripItems } from '@/data/mockData';

interface AppState {
  familyMembers: FamilyMember[];
  medicines: Medicine[];
  trips: Trip[];
  tripItems: TripItem[];
  initialized: boolean;

  initIfEmpty: () => void;

  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;

  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  addTrip: (
    trip: Omit<Trip, 'id' | 'createdAt' | 'status'>,
    suggestedItems: { medicineId: string; suggestedQuantity: number }[]
  ) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setTripStatus: (id: string, status: TripStatus) => void;

  getTripItems: (tripId: string) => TripItem[];
  addTripItem: (
    tripId: string,
    data: {
      medicineId: string;
      suggestedQuantity: number;
      addedManually?: boolean;
    }
  ) => void;
  updateTripItem: (id: string, updates: Partial<TripItem>) => void;
  deleteTripItem: (id: string) => void;
  togglePacked: (tripItemId: string) => void;
  setPackedQuantity: (tripItemId: string, quantity: number) => void;
  setPackedBy: (tripItemId: string, memberId: string) => void;

  addConsumption: (
    tripItemId: string,
    data: Omit<ConsumptionLog, 'id' | 'timestamp'>
  ) => void;
  removeConsumption: (tripItemId: string, logId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      familyMembers: [],
      medicines: [],
      trips: [],
      tripItems: [],
      initialized: false,

      initIfEmpty: () => {
        const state = get();
        if (state.initialized) return;
        if (
          state.familyMembers.length === 0 &&
          state.medicines.length === 0 &&
          state.trips.length === 0
        ) {
          set({
            familyMembers: mockFamilyMembers,
            medicines: mockMedicines,
            trips: mockTrips,
            tripItems: mockTripItems,
            initialized: true,
          });
        } else {
          set({ initialized: true });
        }
      },

      addFamilyMember: (member) =>
        set((s) => ({
          familyMembers: [
            ...s.familyMembers,
            { ...member, id: generateId('fm'), createdAt: new Date().toISOString() },
          ],
        })),

      updateFamilyMember: (id, updates) =>
        set((s) => ({
          familyMembers: s.familyMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteFamilyMember: (id) =>
        set((s) => ({
          familyMembers: s.familyMembers.filter((m) => m.id !== id),
          medicines: s.medicines.map((m) =>
            m.applicableTo === id ? { ...m, applicableTo: 'all' } : m
          ),
          trips: s.trips.map((t) => ({
            ...t,
            companionIds: t.companionIds.filter((cid) => cid !== id),
          })),
        })),

      addMedicine: (medicine) =>
        set((s) => ({
          medicines: [
            ...s.medicines,
            { ...medicine, id: generateId('med'), createdAt: new Date().toISOString() },
          ],
        })),

      updateMedicine: (id, updates) =>
        set((s) => ({
          medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteMedicine: (id) =>
        set((s) => ({
          medicines: s.medicines.filter((m) => m.id !== id),
          tripItems: s.tripItems.filter((ti) => ti.medicineId !== id),
          familyMembers: s.familyMembers.map((fm) => ({
            ...fm,
            dedicatedMedicineIds: fm.dedicatedMedicineIds.filter((mid) => mid !== id),
          })),
        })),

      adjustStock: (id, delta) =>
        set((s) => ({
          medicines: s.medicines.map((m) =>
            m.id === id
              ? { ...m, stockQuantity: Math.max(0, m.stockQuantity + delta) }
              : m
          ),
        })),

      addTrip: (trip, suggestedItems) => {
        const tripId = generateId('trip');
        const items: TripItem[] = suggestedItems.map((si) => ({
          id: generateId('ti'),
          tripId,
          medicineId: si.medicineId,
          suggestedQuantity: si.suggestedQuantity,
          packedQuantity: 0,
          packedBy: '',
          isPacked: false,
          consumedQuantity: 0,
          consumptionLog: [],
        }));
        set((s) => ({
          trips: [
            ...s.trips,
            {
              ...trip,
              id: tripId,
              status: 'planning',
              createdAt: new Date().toISOString(),
            },
          ],
          tripItems: [...s.tripItems, ...items],
        }));
        return tripId;
      },

      updateTrip: (id, updates) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTrip: (id) =>
        set((s) => ({
          trips: s.trips.filter((t) => t.id !== id),
          tripItems: s.tripItems.filter((ti) => ti.tripId !== id),
        })),

      setTripStatus: (id, status) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      getTripItems: (tripId) => {
        return get().tripItems.filter((ti) => ti.tripId === tripId);
      },

      addTripItem: (tripId, data) =>
        set((s) => ({
          tripItems: [
            ...s.tripItems,
            {
              id: generateId('ti'),
              tripId,
              medicineId: data.medicineId,
              suggestedQuantity: data.suggestedQuantity,
              packedQuantity: 0,
              packedBy: '',
              isPacked: false,
              consumedQuantity: 0,
              consumptionLog: [],
              addedManually: data.addedManually ?? false,
            },
          ],
        })),

      updateTripItem: (id, updates) =>
        set((s) => ({
          tripItems: s.tripItems.map((ti) =>
            ti.id === id ? { ...ti, ...updates } : ti
          ),
        })),

      deleteTripItem: (id) =>
        set((s) => ({
          tripItems: s.tripItems.filter((ti) => ti.id !== id),
        })),

      togglePacked: (tripItemId) =>
        set((s) => ({
          tripItems: s.tripItems.map((ti) => {
            if (ti.id !== tripItemId) return ti;
            const willPack = !ti.isPacked;
            return {
              ...ti,
              isPacked: willPack,
              packedQuantity: willPack
                ? ti.packedQuantity || ti.suggestedQuantity
                : 0,
            };
          }),
        })),

      setPackedQuantity: (tripItemId, quantity) =>
        set((s) => ({
          tripItems: s.tripItems.map((ti) =>
            ti.id === tripItemId
              ? {
                  ...ti,
                  packedQuantity: Math.max(0, quantity),
                  isPacked: quantity > 0 ? true : ti.isPacked,
                }
              : ti
          ),
        })),

      setPackedBy: (tripItemId, memberId) =>
        set((s) => ({
          tripItems: s.tripItems.map((ti) =>
            ti.id === tripItemId ? { ...ti, packedBy: memberId } : ti
          ),
        })),

      addConsumption: (tripItemId, data) => {
        const log: ConsumptionLog = {
          ...data,
          id: generateId('cl'),
          timestamp: new Date().toISOString(),
        };
        set((s) => {
          const item = s.tripItems.find((ti) => ti.id === tripItemId);
          if (item && data.quantity > 0) {
            s.adjustStock(item.medicineId, -data.quantity);
          }
          return {
            tripItems: s.tripItems.map((ti) =>
              ti.id === tripItemId
                ? {
                    ...ti,
                    consumedQuantity: ti.consumedQuantity + data.quantity,
                    consumptionLog: [...ti.consumptionLog, log],
                  }
                : ti
            ),
          };
        });
      },

      removeConsumption: (tripItemId, logId) =>
        set((s) => ({
          tripItems: s.tripItems.map((ti) => {
            if (ti.id !== tripItemId) return ti;
            const log = ti.consumptionLog.find((l) => l.id === logId);
            if (log) {
              s.adjustStock(ti.medicineId, log.quantity);
            }
            return {
              ...ti,
              consumedQuantity: ti.consumedQuantity - (log?.quantity || 0),
              consumptionLog: ti.consumptionLog.filter((l) => l.id !== logId),
            };
          }),
        })),
    }),
    {
      name: 'travel-medkit-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
