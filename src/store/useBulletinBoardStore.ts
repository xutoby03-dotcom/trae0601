import { create } from 'zustand';
import type { BulletinBoard } from '../types';
import { mockBulletinBoards } from '../mock/bulletinBoards';

interface BulletinBoardState {
  bulletinBoards: BulletinBoard[];
  loading: boolean;
  fetchBulletinBoards: () => void;
  getBulletinBoardById: (id: string) => BulletinBoard | undefined;
  getBulletinBoardsByArea: (area: string) => BulletinBoard[];
  getAvailableBoards: () => BulletinBoard[];
  updateOccupiedSlots: (id: string, delta: number) => void;
  getAreaOccupancy: () => { area: string; total: number; occupied: number; rate: number }[];
}

const STORAGE_KEY = 'poster_management_bulletin_boards';

const loadFromStorage = (): BulletinBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load bulletin boards from storage:', e);
  }
  return mockBulletinBoards;
};

const saveToStorage = (boards: BulletinBoard[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error('Failed to save bulletin boards to storage:', e);
  }
};

export const useBulletinBoardStore = create<BulletinBoardState>((set, get) => ({
  bulletinBoards: loadFromStorage(),
  loading: false,

  fetchBulletinBoards: () => {
    set({ loading: true });
    const boards = loadFromStorage();
    set({ bulletinBoards: boards, loading: false });
  },

  getBulletinBoardById: (id) => {
    return get().bulletinBoards.find((b) => b.id === id);
  },

  getBulletinBoardsByArea: (area) => {
    return get().bulletinBoards.filter((b) => b.area === area);
  },

  getAvailableBoards: () => {
    return get().bulletinBoards.filter((b) => b.occupiedSlots < b.totalSlots);
  },

  updateOccupiedSlots: (id, delta) => {
    const boards = get().bulletinBoards.map((b) =>
      b.id === id
        ? {
            ...b,
            occupiedSlots: Math.max(
              0,
              Math.min(b.totalSlots, b.occupiedSlots + delta)
            ),
          }
        : b
    );
    set({ bulletinBoards: boards });
    saveToStorage(boards);
  },

  getAreaOccupancy: () => {
    const boards = get().bulletinBoards;
    const areaMap = new Map<
      string,
      { total: number; occupied: number }
    >();

    boards.forEach((b) => {
      const existing = areaMap.get(b.area) || { total: 0, occupied: 0 };
      areaMap.set(b.area, {
        total: existing.total + b.totalSlots,
        occupied: existing.occupied + b.occupiedSlots,
      });
    });

    return Array.from(areaMap.entries()).map(([area, data]) => ({
      area,
      total: data.total,
      occupied: data.occupied,
      rate: data.total > 0 ? data.occupied / data.total : 0,
    }));
  },
}));
