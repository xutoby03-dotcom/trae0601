import { create } from "zustand";
import type { BalconyProfile } from "@/types";
import { mockBalcony } from "@/data/mockData";

interface BalconyStore {
  profile: BalconyProfile;
  updateProfile: (data: Partial<BalconyProfile>) => void;
  resetToMock: () => void;
}

export const useBalconyStore = create<BalconyStore>((set) => ({
  profile: mockBalcony,

  updateProfile: (data) =>
    set((state) => ({
      profile: { ...state.profile, ...data },
    })),

  resetToMock: () => set({ profile: mockBalcony }),
}));
