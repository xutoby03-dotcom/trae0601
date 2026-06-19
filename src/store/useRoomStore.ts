import { create } from 'zustand';
import type { Room } from '@/types';
import { mockRooms } from '@/utils/mockData';
import { persist } from 'zustand/middleware';

interface RoomState {
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  getRoom: (id: string) => Room | undefined;
  setRoomStatus: (id: string, status: Room['status']) => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,
      addRoom: (roomData) => {
        const newRoom: Room = {
          ...roomData,
          id: `room-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ rooms: [...state.rooms, newRoom] }));
      },
      updateRoom: (id, roomData) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === id
              ? { ...room, ...roomData, updatedAt: new Date().toISOString() }
              : room
          ),
        }));
      },
      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== id),
        }));
      },
      getRoom: (id) => {
        return get().rooms.find((room) => room.id === id);
      },
      setRoomStatus: (id, status) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === id
              ? { ...room, status, updatedAt: new Date().toISOString() }
              : room
          ),
        }));
      },
    }),
    {
      name: 'water-heater-rooms',
    }
  )
);
