import { create } from 'zustand';
import { Elderly } from '@/types';
import { mockElderly } from '@/data/elderly';
import { getStorage, setStorage, generateId } from '@/utils/storage';

interface ElderlyState {
  elderlyList: Elderly[];
  loading: boolean;
  initElderly: () => void;
  addElderly: (elderly: Omit<Elderly, 'id'>) => void;
  updateElderly: (id: string, data: Partial<Elderly>) => void;
  deleteElderly: (id: string) => void;
  getElderlyById: (id: string) => Elderly | undefined;
  getElderlyByGrid: (gridId: string) => Elderly[];
}

const STORAGE_KEY = 'elderly_list';

export const useElderlyStore = create<ElderlyState>((set, get) => ({
  elderlyList: [],
  loading: true,

  initElderly: () => {
    const stored = getStorage<Elderly[]>(STORAGE_KEY, []);
    const initialData = stored.length > 0 ? stored : mockElderly;
    set({ elderlyList: initialData, loading: false });
    if (stored.length === 0) {
      setStorage(STORAGE_KEY, mockElderly);
    }
  },

  addElderly: (elderly) => {
    const newElderly: Elderly = {
      ...elderly,
      id: generateId(),
    };
    const newList = [...get().elderlyList, newElderly];
    set({ elderlyList: newList });
    setStorage(STORAGE_KEY, newList);
  },

  updateElderly: (id, data) => {
    const newList = get().elderlyList.map(e =>
      e.id === id ? { ...e, ...data } : e
    );
    set({ elderlyList: newList });
    setStorage(STORAGE_KEY, newList);
  },

  deleteElderly: (id) => {
    const newList = get().elderlyList.filter(e => e.id !== id);
    set({ elderlyList: newList });
    setStorage(STORAGE_KEY, newList);
  },

  getElderlyById: (id) => {
    return get().elderlyList.find(e => e.id === id);
  },

  getElderlyByGrid: (gridId) => {
    return get().elderlyList.filter(e => e.gridId === gridId);
  },
}));
