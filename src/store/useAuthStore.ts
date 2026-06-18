import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/apiClient";
import type { User } from "shared/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setUser: (user: User) => void;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<LoginResponse>("/auth/login", {
            username,
            password,
          });

          if (response.success && response.data) {
            const { token, user } = response.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, message: "登录成功" };
          }

          set({ isLoading: false });
          return { success: false, message: response.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error instanceof Error ? error.message : "登录失败",
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("auth-storage");
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
