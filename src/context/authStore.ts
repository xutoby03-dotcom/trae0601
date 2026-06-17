import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  userRole: 'admin' | 'registrar' | null;
  login: (role: 'admin' | 'registrar') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userRole: null,
  login: (role) => set({ isLoggedIn: true, userRole: role }),
  logout: () => set({ isLoggedIn: false, userRole: null }),
}));
