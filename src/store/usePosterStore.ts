import { create } from 'zustand';
import type { Poster, PosterStatus } from '../types';
import { mockPosters } from '../mock/posters';
import { generateId } from '../utils/date';

interface PosterState {
  posters: Poster[];
  loading: boolean;
  fetchPosters: () => void;
  addPoster: (poster: Omit<Poster, 'id' | 'createdAt' | 'status'>) => Poster;
  updatePoster: (id: string, data: Partial<Poster>) => void;
  deletePoster: (id: string) => void;
  updateStatus: (id: string, status: PosterStatus) => void;
  getPosterById: (id: string) => Poster | undefined;
  getPostersByStatus: (status: PosterStatus) => Poster[];
  getPostersByClub: (club: string) => Poster[];
  getExpiringSoon: () => Poster[];
  getExpired: () => Poster[];
}

const STORAGE_KEY = 'poster_management_posters';

const loadFromStorage = (): Poster[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load posters from storage:', e);
  }
  return mockPosters;
};

const saveToStorage = (posters: Poster[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posters));
  } catch (e) {
    console.error('Failed to save posters to storage:', e);
  }
};

export const usePosterStore = create<PosterState>((set, get) => ({
  posters: loadFromStorage(),
  loading: false,

  fetchPosters: () => {
    set({ loading: true });
    const posters = loadFromStorage();
    set({ posters, loading: false });
  },

  addPoster: (posterData) => {
    const hasApproval = posterData.approvalNumber && posterData.approvalNumber.trim() !== '';
    const newPoster: Poster = {
      ...posterData,
      id: generateId(),
      status: hasApproval ? 'approved' : 'draft',
      createdAt: new Date().toISOString(),
    };
    const posters = [...get().posters, newPoster];
    set({ posters });
    saveToStorage(posters);
    return newPoster;
  },

  updatePoster: (id, data) => {
    const posters = get().posters.map((p) => {
      if (p.id === id) {
        const hasApproval = (data.approvalNumber || p.approvalNumber) && 
          (data.approvalNumber || p.approvalNumber).trim() !== '';
        const currentStatus = data.status || p.status;
        const newStatus = currentStatus === 'draft' && hasApproval ? 'approved' : currentStatus;
        return { ...p, ...data, status: newStatus };
      }
      return p;
    });
    set({ posters });
    saveToStorage(posters);
  },

  deletePoster: (id) => {
    const posters = get().posters.filter((p) => p.id !== id);
    set({ posters });
    saveToStorage(posters);
  },

  updateStatus: (id, status) => {
    const posters = get().posters.map((p) =>
      p.id === id ? { ...p, status } : p
    );
    set({ posters });
    saveToStorage(posters);
  },

  getPosterById: (id) => {
    return get().posters.find((p) => p.id === id);
  },

  getPostersByStatus: (status) => {
    return get().posters.filter((p) => p.status === status);
  },

  getPostersByClub: (club) => {
    return get().posters.filter((p) => p.club === club);
  },

  getExpiringSoon: () => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    return get().posters.filter((p) => {
      if (p.status !== 'posted' && p.status !== 'posting') return false;
      const endDate = new Date(p.endDate);
      return endDate >= today && endDate <= threeDaysLater;
    });
  },

  getExpired: () => {
    const today = new Date();
    return get().posters.filter((p) => {
      const endDate = new Date(p.endDate);
      return endDate < today && p.status !== 'removed';
    });
  },
}));
