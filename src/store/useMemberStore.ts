import { create } from 'zustand';
import type { Member } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';
import { mockMembers } from '@/utils/mockData';

const STORAGE_KEY = 'chorus_members';

interface MemberState {
  members: Member[];
  fetchMembers: () => void;
  addMember: (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
}

const initializeMembers = (): Member[] => {
  const stored = getStorage<Member[] | null>(STORAGE_KEY, null);
  if (stored && stored.length > 0) {
    return stored;
  }
  setStorage(STORAGE_KEY, mockMembers);
  return mockMembers;
};

export const useMemberStore = create<MemberState>((set, get) => ({
  members: initializeMembers(),

  fetchMembers: () => {
    const members = getStorage<Member[]>(STORAGE_KEY, []);
    set({ members });
  },

  addMember: (memberData) => {
    const now = new Date().toISOString();
    const newMember: Member = {
      ...memberData,
      id: `member-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    const members = [...get().members, newMember];
    set({ members });
    setStorage(STORAGE_KEY, members);
  },

  updateMember: (id, memberData) => {
    const members = get().members.map((member) =>
      member.id === id
        ? { ...member, ...memberData, updated_at: new Date().toISOString() }
        : member
    );
    set({ members });
    setStorage(STORAGE_KEY, members);
  },

  deleteMember: (id) => {
    const members = get().members.filter((member) => member.id !== id);
    set({ members });
    setStorage(STORAGE_KEY, members);
  },

  getMemberById: (id) => {
    return get().members.find((member) => member.id === id);
  },
}));
