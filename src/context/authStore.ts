import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  userRole: 'admin' | 'registrar' | null;
  login: (role: 'admin' | 'registrar') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userRole: null,
      login: (role) => set({ isLoggedIn: true, userRole: role }),
      logout: () => set({ isLoggedIn: false, userRole: null }),
    }),
    {
      name: 'umbrella-auth',
    }
  )
);
