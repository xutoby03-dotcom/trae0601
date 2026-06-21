import { create } from 'zustand';
import type { Member, VoicePart } from '@/types';
import { generateId, now } from '@/utils/helpers';
import { MOCK_MEMBERS } from '@/mock/seedData';

interface MembersState {
  members: Member[];
  addMember: (data: Omit<Member, 'id' | 'createdAt'>) => Member;
  updateMember: (id: string, data: Partial<Omit<Member, 'id' | 'createdAt'>>) => void;
  deleteMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  getByVoicePart: (part: VoicePart) => Member[];
}

const STORAGE_KEY = 'choir_members_v1';

function loadFromStorage(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_MEMBERS;
}

function saveToStorage(members: Member[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {}
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: loadFromStorage(),

  addMember: (data) => {
    const newMember: Member = {
      ...data,
      id: generateId('m'),
      createdAt: now(),
    };
    set((state) => {
      const next = [...state.members, newMember];
      saveToStorage(next);
      return { members: next };
    });
    return newMember;
  },

  updateMember: (id, data) => {
    set((state) => {
      const next = state.members.map((m) =>
        m.id === id ? { ...m, ...data } : m
      );
      saveToStorage(next);
      return { members: next };
    });
  },

  deleteMember: (id) => {
    set((state) => {
      const next = state.members.filter((m) => m.id !== id);
      saveToStorage(next);
      return { members: next };
    });
  },

  getMember: (id) => get().members.find((m) => m.id === id),

  getByVoicePart: (part) => get().members.filter((m) => m.voicePart === part),
}));
