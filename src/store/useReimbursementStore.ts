import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReimbursementItem } from '../types';

const STORAGE_KEY_REIMBURSEMENTS_V2 = 'overtime-meal-reimbursements-v2';

interface ReimbursementStore {
  items: ReimbursementItem[];
  addItem: (item: Omit<ReimbursementItem, 'id' | 'createdAt'>) => void;
  updateStatus: (id: string, status: ReimbursementItem['status'], reviewer: string, note?: string) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => ReimbursementItem | undefined;
}

export const useReimbursementStore = create<ReimbursementStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            {
              ...item,
              id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        })),
      updateStatus: (id, status, reviewer, note) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status, reviewedBy: reviewer, reviewNote: note }
              : item
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      getItem: (id) => get().items.find((item) => item.id === id),
    }),
    {
      name: STORAGE_KEY_REIMBURSEMENTS_V2,
    }
  )
);
