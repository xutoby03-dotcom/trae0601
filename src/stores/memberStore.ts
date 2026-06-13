import { create } from 'zustand';
import type { Member, MemberLevel } from '@/types';
import { mockMembers } from '@/data/mockData';
import { generateId } from '@/utils';
import { getFromStorage, setToStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'birthday_coupon_members';

interface MemberState {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
  searchMembers: (keyword: string) => Member[];
}

const initialMembers = (): Member[] => {
  const stored = getFromStorage<Member[] | null>(STORAGE_KEY, null);
  if (stored && stored.length > 0) return stored;
  return mockMembers;
};

export const useMemberStore = create<MemberState>((set, get) => ({
  members: initialMembers(),

  addMember: (member) => {
    const newMember: Member = {
      ...member,
      id: generateId('m'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const newMembers = [...get().members, newMember];
    set({ members: newMembers });
    setToStorage(STORAGE_KEY, newMembers);
  },

  updateMember: (id, member) => {
    const newMembers = get().members.map((m) =>
      m.id === id ? { ...m, ...member } : m
    );
    set({ members: newMembers });
    setToStorage(STORAGE_KEY, newMembers);
  },

  deleteMember: (id) => {
    const newMembers = get().members.filter((m) => m.id !== id);
    set({ members: newMembers });
    setToStorage(STORAGE_KEY, newMembers);
  },

  getMemberById: (id) => {
    return get().members.find((m) => m.id === id);
  },

  searchMembers: (keyword) => {
    if (!keyword) return get().members;
    const lower = keyword.toLowerCase();
    return get().members.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.phone.includes(keyword)
    );
  },
}));
