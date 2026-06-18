import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shelf, ShelfSlot, PackageSize } from '@/types';
import { generateId } from '@/utils';
import { MOCK_SHELVES, generateShelfSlots } from '@/mock/data';

interface ShelfState {
  shelves: Shelf[];
  slots: ShelfSlot[];
  addShelf: (data: Omit<Shelf, 'id' | 'createdAt'>) => void;
  updateShelf: (id: string, data: Partial<Shelf>) => void;
  deleteShelf: (id: string) => void;
  getShelfById: (id: string) => Shelf | undefined;
  getSlotsByShelfId: (shelfId: string) => ShelfSlot[];
  getAvailableSlots: (shelfId: string, size?: PackageSize) => ShelfSlot[];
  setSlotOccupied: (slotId: string, occupied: boolean) => void;
  getTotalCapacity: () => number;
  getOccupiedCount: () => number;
}

function initializeSlots(shelves: Shelf[]): ShelfSlot[] {
  const allSlots: ShelfSlot[] = [];
  shelves.forEach((shelf) => {
    allSlots.push(...generateShelfSlots(shelf));
  });
  return allSlots;
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => ({
      shelves: MOCK_SHELVES,
      slots: initializeSlots(MOCK_SHELVES),

      addShelf: (data) => {
        const newShelf: Shelf = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const newSlots = generateShelfSlots(newShelf);
        set((state) => ({
          shelves: [...state.shelves, newShelf],
          slots: [...state.slots, ...newSlots],
        }));
      },

      updateShelf: (id, data) => {
        set((state) => ({
          shelves: state.shelves.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }));
      },

      deleteShelf: (id) => {
        set((state) => ({
          shelves: state.shelves.filter((s) => s.id !== id),
          slots: state.slots.filter((s) => s.shelfId !== id),
        }));
      },

      getShelfById: (id) => get().shelves.find((s) => s.id === id),

      getSlotsByShelfId: (shelfId) => get().slots.filter((s) => s.shelfId === shelfId),

      getAvailableSlots: (shelfId, size) => {
        return get().slots.filter(
          (s) => s.shelfId === shelfId && !s.isOccupied && (!size || s.sizeLevel === size),
        );
      },

      setSlotOccupied: (slotId, occupied) => {
        set((state) => ({
          slots: state.slots.map((s) => (s.id === slotId ? { ...s, isOccupied: occupied } : s)),
        }));
      },

      getTotalCapacity: () => get().slots.length,

      getOccupiedCount: () => get().slots.filter((s) => s.isOccupied).length,
    }),
    {
      name: 'shelf-storage',
    },
  ),
);
