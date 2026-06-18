import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Furniture, FurnitureStatus } from '../types';
import { mockFurniture } from '../mock/data';

interface FurnitureState {
  furnitureList: Furniture[];
  addFurniture: (furniture: Omit<Furniture, 'id' | 'createdAt'>) => void;
  updateFurniture: (id: string, data: Partial<Furniture>) => void;
  deleteFurniture: (id: string) => void;
  getFurnitureById: (id: string) => Furniture | undefined;
  getFurnitureByRoom: (room: string) => Furniture[];
  updateStatus: (id: string, status: FurnitureStatus) => void;
}

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `FJ-${timestamp}-${random}`;
};

export const useFurnitureStore = create<FurnitureState>()(
  persist(
    (set, get) => ({
      furnitureList: mockFurniture,

      addFurniture: (furniture) => {
        const newFurniture: Furniture = {
          ...furniture,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          furnitureList: [...state.furnitureList, newFurniture],
        }));
      },

      updateFurniture: (id, data) => {
        set((state) => ({
          furnitureList: state.furnitureList.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      },

      deleteFurniture: (id) => {
        set((state) => ({
          furnitureList: state.furnitureList.filter((item) => item.id !== id),
        }));
      },

      getFurnitureById: (id) => {
        return get().furnitureList.find((item) => item.id === id);
      },

      getFurnitureByRoom: (room) => {
        return get().furnitureList.filter((item) => item.room === room);
      },

      updateStatus: (id, status) => {
        set((state) => ({
          furnitureList: state.furnitureList.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }));
      },
    }),
    {
      name: 'furniture-storage-v2',
    }
  )
);
