import { create } from 'zustand';
import { api } from '@/services/api';

interface MemberState {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  createMember: (data: Omit<Member, 'id' | 'createdAt' | 'confirmed'>) => Promise<Member>;
  updateMember: (id: string, data: Partial<Member>) => Promise<Member | undefined>;
  deleteMember: (id: string) => Promise<boolean>;
  confirmMember: (id: string) => Promise<Member | undefined>;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const members = await api.members.getAll();
      set({ members, loading: false });
    } catch (error) {
      set({ error: '获取成员列表失败', loading: false });
    }
  },

  createMember: async (data) => {
    set({ loading: true, error: null });
    try {
      const member = await api.members.create(data);
      set((state) => ({ members: [...state.members, member], loading: false }));
      return member;
    } catch (error) {
      set({ error: '创建成员失败', loading: false });
      throw error;
    }
  },

  updateMember: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.members.update(id, data);
      if (updated) {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? updated : m)),
          loading: false,
        }));
      }
      return updated;
    } catch (error) {
      set({ error: '更新成员失败', loading: false });
      throw error;
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.members.delete(id);
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: '删除成员失败', loading: false });
      return false;
    }
  },

  confirmMember: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.members.confirm(id);
      if (updated) {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? updated : m)),
          loading: false,
        }));
      }
      return updated;
    } catch (error) {
      set({ error: '确认成员失败', loading: false });
      throw error;
    }
  },
}));
