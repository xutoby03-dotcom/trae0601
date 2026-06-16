import { create } from 'zustand';
import { db } from '@/db';
import type { User, UserRole } from '@/types';
import { generateId } from '@/utils/id';

interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

interface UserActions {
  login: (username: string, role: UserRole) => Promise<User | null>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
}

export type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null,
  users: [],
  loading: false,
  error: null,

  login: async (username, role) => {
    set({ loading: true, error: null });
    try {
      let user = await db.users.where('username').equals(username).first();
      
      if (!user) {
        const now = new Date().toISOString();
        const newUser: User = {
          id: generateId('user'),
          username,
          role,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        await db.users.add(newUser);
        user = newUser;
      }

      if (!user.isActive) {
        throw new Error('用户已被禁用');
      }

      set({ currentUser: user, loading: false });
      return user;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '登录失败', loading: false });
      return null;
    }
  },

  logout: () => {
    set({ currentUser: null });
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await db.users.orderBy('createdAt').reverse().toArray();
      set({ users, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取用户列表失败', loading: false });
    }
  },

  addUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const newUser: User = {
        ...userData,
        id: generateId('user'),
        createdAt: now,
        updatedAt: now,
      };
      await db.users.add(newUser);
      
      const users = await db.users.orderBy('createdAt').reverse().toArray();
      set({ users, loading: false });
      return newUser;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加用户失败', loading: false });
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.users.update(id, { ...updates, updatedAt: now });
      
      const users = await db.users.orderBy('createdAt').reverse().toArray();
      const { currentUser } = get();
      if (currentUser?.id === id) {
        const updatedUser = users.find(u => u.id === id);
        set({ currentUser: updatedUser || null });
      }
      set({ users, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新用户失败', loading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.users.delete(id);
      const users = await db.users.orderBy('createdAt').reverse().toArray();
      const { currentUser } = get();
      if (currentUser?.id === id) {
        set({ currentUser: null });
      }
      set({ users, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除用户失败', loading: false });
      throw error;
    }
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
