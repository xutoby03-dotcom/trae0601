import { create } from 'zustand';
import type { Friend } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { initialFriends } from '@/utils/mockData';
import { formatDate } from '@/utils/condition';

const STORAGE_KEY = 'friends';

interface FriendStore {
  friends: Friend[];
  addFriend: (friend: Omit<Friend, 'id' | 'createdAt'>) => void;
  updateFriend: (id: string, friend: Partial<Friend>) => void;
  deleteFriend: (id: string) => void;
  getFriendById: (id: string) => Friend | undefined;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: loadFromStorage<Friend[]>(STORAGE_KEY, initialFriends),

  addFriend: (friend) => {
    const newFriend: Friend = {
      ...friend,
      id: Date.now().toString(),
      createdAt: formatDate(new Date()),
    };
    const friends = [...get().friends, newFriend];
    set({ friends });
    saveToStorage(STORAGE_KEY, friends);
  },

  updateFriend: (id, friend) => {
    const friends = get().friends.map((f) =>
      f.id === id ? { ...f, ...friend } : f
    );
    set({ friends });
    saveToStorage(STORAGE_KEY, friends);
  },

  deleteFriend: (id) => {
    const friends = get().friends.filter((f) => f.id !== id);
    set({ friends });
    saveToStorage(STORAGE_KEY, friends);
  },

  getFriendById: (id) => {
    return get().friends.find((f) => f.id === id);
  },
}));
