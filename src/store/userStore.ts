import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { mockUsers } from "@/mock/users";

interface UserState {
  users: User[];
  currentUserId: string;
  setUsers: (users: User[]) => void;
  setCurrentUser: (userId: string) => void;
  getCurrentUser: () => User | undefined;
  getUserById: (userId: string) => User | undefined;
  getUsersByRole: (role: User["role"]) => User[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      currentUserId: "A001",

      setUsers: (users) => set({ users }),

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId);
      },

      getUserById: (userId) => {
        return get().users.find((u) => u.id === userId);
      },

      getUsersByRole: (role) => {
        return get().users.filter((u) => u.role === role);
      },
    }),
    {
      name: "user-store",
    }
  )
);
