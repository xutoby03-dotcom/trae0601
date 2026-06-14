import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Display, Reservation, ReservationStatus, DisplayStatus, TimeSlot } from '../types';
import { mockDisplays, mockReservations } from '../data/mockData';
import { formatISO } from 'date-fns';

function timeSlotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  if (a === 'allday' || b === 'allday') return true;
  return a === b;
}

interface StoreState {
  displays: Display[];
  reservations: Reservation[];

  addDisplay: (d: Omit<Display, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDisplay: (id: string, d: Partial<Display>) => void;
  deleteDisplay: (id: string) => void;

  addReservation: (r: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => boolean;
  updateReservation: (id: string, r: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;

  checkConflict: (displayId: string, useDate: string, timeSlot: TimeSlot, excludeId?: string) => boolean;
  canReserve: (displayId: string) => boolean;

  completeReturn: (
    reservationId: string,
    check: {
      hasPowerCable: boolean;
      hasAdapter: boolean;
      hasScratch: boolean;
      inCorrectLocation: boolean;
      returnNotes?: string;
    }
  ) => void;

  initMockDataIfEmpty: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      displays: [],
      reservations: [],

      initMockDataIfEmpty: () => {
        const { displays, reservations } = get();
        if (displays.length === 0 && reservations.length === 0) {
          set({ displays: mockDisplays, reservations: mockReservations });
        }
      },

      addDisplay: (d) =>
        set((s) => ({
          displays: [
            {
              ...d,
              id: `d${Date.now()}`,
              createdAt: formatISO(new Date()),
              updatedAt: formatISO(new Date()),
            },
            ...s.displays,
          ],
        })),

      updateDisplay: (id, d) =>
        set((s) => ({
          displays: s.displays.map((x) =>
            x.id === id ? { ...x, ...d, updatedAt: formatISO(new Date()) } : x
          ),
        })),

      deleteDisplay: (id) =>
        set((s) => ({
          displays: s.displays.filter((x) => x.id !== id),
        })),

      checkConflict: (displayId, useDate, timeSlot, excludeId) => {
        const { reservations } = get();
        return reservations.some((r) => {
          if (r.id === excludeId) return false;
          if (r.status === 'cancelled' || r.status === 'returned') return false;
          if (r.displayId !== displayId) return false;
          if (r.useDate !== useDate) return false;
          return timeSlotsOverlap(r.timeSlot, timeSlot);
        });
      },

      canReserve: (displayId) => {
        const { displays } = get();
        const d = displays.find((x) => x.id === displayId);
        if (!d) return false;
        if (d.status !== 'available') return false;
        if (d.missingAccessories.length > 0) return false;
        return true;
      },

      addReservation: (r) => {
        const { checkConflict, canReserve } = get();
        if (!canReserve(r.displayId)) return false;
        if (checkConflict(r.displayId, r.useDate, r.timeSlot)) return false;

        const newRes: Reservation = {
          ...r,
          id: `r${Date.now()}`,
          status: 'reserved',
          createdAt: formatISO(new Date()),
        };

        set((s) => ({ reservations: [newRes, ...s.reservations] }));
        return true;
      },

      updateReservation: (id, r) =>
        set((s) => ({
          reservations: s.reservations.map((x) => (x.id === id ? { ...x, ...r } : x)),
        })),

      cancelReservation: (id) =>
        set((s) => ({
          reservations: s.reservations.map((x) =>
            x.id === id ? { ...x, status: 'cancelled' as ReservationStatus } : x
          ),
        })),

      completeReturn: (reservationId, check) => {
        const { reservations, displays } = get();
        const reservation = reservations.find((r) => r.id === reservationId);
        if (!reservation) return;

        const display = displays.find((d) => d.id === reservation.displayId);
        if (!display) return;

        let newDamageCount = display.damageCount;
        const newMissing: string[] = [...display.missingAccessories];

        if (check.hasScratch) newDamageCount++;
        if (!check.hasPowerCable && !newMissing.includes('电源线')) newMissing.push('电源线');
        if (!check.hasAdapter) {
          const adapters = display.accessories
            .filter((a) => a.name.includes('转接头') || a.name.includes('线'))
            .map((a) => a.name);
          adapters.forEach((a) => {
            if (!newMissing.includes(a)) newMissing.push(a);
          });
        }

        let newStatus: DisplayStatus = display.status;
        if (newMissing.length > 0) newStatus = 'missing';
        else if (check.hasScratch && newDamageCount >= 5) newStatus = 'maintenance';
        else newStatus = 'available';

        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: 'returned' as ReservationStatus,
                  returnTime: formatISO(new Date()),
                  ...check,
                }
              : r
          ),
          displays: s.displays.map((d) =>
            d.id === reservation.displayId
              ? {
                  ...d,
                  status: newStatus,
                  damageCount: newDamageCount,
                  missingAccessories: newMissing,
                  updatedAt: formatISO(new Date()),
                }
              : d
          ),
        }));
      },
    }),
    {
      name: 'display-rental-store',
      version: 1,
    }
  )
);
