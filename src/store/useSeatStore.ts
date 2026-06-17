import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Seat } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface SeatState {
  seats: Seat[];
  setSeats: (seats: Seat[]) => void;
  addSeat: (seat: Omit<Seat, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSeat: (id: string, data: Partial<Seat>) => void;
  deleteSeat: (id: string) => void;
  getSeatById: (id: string) => Seat | undefined;
}

export const useSeatStore = create<SeatState>()(
  persist(
    (set, get) => ({
      seats: [],
      
      setSeats: (seats) => set({ seats }),
      
      addSeat: (seatData) => {
        const now = new Date().toISOString();
        const newSeat: Seat = {
          ...seatData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ seats: [...get().seats, newSeat] });
      },
      
      updateSeat: (id, data) => {
        set({
          seats: get().seats.map(s =>
            s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
          ),
        });
      },
      
      deleteSeat: (id) => {
        set({ seats: get().seats.filter(s => s.id !== id) });
      },
      
      getSeatById: (id) => {
        return get().seats.find(s => s.id === id);
      },
    }),
    {
      name: STORAGE_KEYS.SEATS,
    }
  )
);
