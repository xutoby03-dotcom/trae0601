import { create } from 'zustand';
import type { PostingItem, PostingStatus } from '../types';
import { mockPostingItems } from '../mock/postingItems';
import { generateId } from '../utils/date';

interface PostingState {
  postingItems: PostingItem[];
  loading: boolean;
  fetchPostingItems: () => void;
  addPostingItem: (item: Omit<PostingItem, 'id' | 'status'>) => PostingItem;
  updatePostingItem: (id: string, data: Partial<PostingItem>) => void;
  deletePostingItem: (id: string) => void;
  confirmPosting: (id: string, photoUrl: string) => void;
  confirmRemoval: (id: string) => void;
  getPostingItemById: (id: string) => PostingItem | undefined;
  getPostingItemsByApplicationId: (applicationId: string) => PostingItem[];
  getPostingItemsByBulletinBoardId: (bulletinBoardId: string) => PostingItem[];
  getPostingItemsByStatus: (status: PostingStatus) => PostingItem[];
  getPendingPostingCount: () => number;
  generatePostingList: (applicationId: string) => PostingItem[];
}

const STORAGE_KEY = 'poster_management_posting_items';

const loadFromStorage = (): PostingItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load posting items from storage:', e);
  }
  return mockPostingItems;
};

const saveToStorage = (items: PostingItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save posting items to storage:', e);
  }
};

export const usePostingStore = create<PostingState>((set, get) => ({
  postingItems: loadFromStorage(),
  loading: false,

  fetchPostingItems: () => {
    set({ loading: true });
    const items = loadFromStorage();
    set({ postingItems: items, loading: false });
  },

  addPostingItem: (itemData) => {
    const newItem: PostingItem = {
      ...itemData,
      id: generateId(),
      status: 'pending',
    };
    const items = [...get().postingItems, newItem];
    set({ postingItems: items });
    saveToStorage(items);
    return newItem;
  },

  updatePostingItem: (id, data) => {
    const items = get().postingItems.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    set({ postingItems: items });
    saveToStorage(items);
  },

  deletePostingItem: (id) => {
    const items = get().postingItems.filter((p) => p.id !== id);
    set({ postingItems: items });
    saveToStorage(items);
  },

  confirmPosting: (id, photoUrl) => {
    const items = get().postingItems.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'posted' as const,
            photoUrl,
            postedAt: new Date().toISOString(),
          }
        : p
    );
    set({ postingItems: items });
    saveToStorage(items);
  },

  confirmRemoval: (id) => {
    const items = get().postingItems.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'removed' as const,
            removedAt: new Date().toISOString(),
          }
        : p
    );
    set({ postingItems: items });
    saveToStorage(items);
  },

  getPostingItemById: (id) => {
    return get().postingItems.find((p) => p.id === id);
  },

  getPostingItemsByApplicationId: (applicationId) => {
    return get().postingItems.filter((p) => p.applicationId === applicationId);
  },

  getPostingItemsByBulletinBoardId: (bulletinBoardId) => {
    return get().postingItems.filter((p) => p.bulletinBoardId === bulletinBoardId);
  },

  getPostingItemsByStatus: (status) => {
    return get().postingItems.filter((p) => p.status === status);
  },

  getPendingPostingCount: () => {
    return get().postingItems.filter((p) => p.status === 'pending').length;
  },

  generatePostingList: (applicationId) => {
    return get().postingItems.filter((p) => p.applicationId === applicationId);
  },
}));
