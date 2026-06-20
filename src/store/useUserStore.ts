import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

interface UserState {
  role: UserRole;
  userName: string;
}

interface UserActions {
  setRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  toggleRole: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      role: 'staff',
      userName: '工作人员',

      setRole: (role) => {
        const userName = role === 'staff' ? '工作人员' : '开线人';
        set({ role, userName });
      },

      setUserName: (name) => set({ userName: name }),

      toggleRole: () => {
        const { role } = get();
        const newRole: UserRole = role === 'staff' ? 'setter' : 'staff';
        const userName = newRole === 'staff' ? '工作人员' : '开线人';
        set({ role: newRole, userName });
      },
    }),
    {
      name: 'climb-user-storage',
    }
  )
);
