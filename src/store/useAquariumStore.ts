import type { Aquarium } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_DATA } from "@/data/seedData";
import { uid, nowStr } from "@/utils/formatters";

const seed = SEED_DATA;

interface AquariumState {
  aquariums: Aquarium[];
  addAquarium: (
    data: Omit<Aquarium, "id" | "created_at" | "updated_at">
  ) => Aquarium;
  updateAquarium: (id: string, data: Partial<Aquarium>) => void;
  removeAquarium: (id: string) => void;
  getAquarium: (id: string) => Aquarium | undefined;
}

export const useAquariumStore = create<AquariumState>()(
  persist(
    (set, get) => ({
      aquariums: seed.aquariums,
      addAquarium: (data) => {
        const now = nowStr();
        const newAq: Aquarium = {
          ...data,
          id: uid(),
          created_at: now,
          updated_at: now,
        };
        set((s) => ({ aquariums: [...s.aquariums, newAq] }));
        return newAq;
      },
      updateAquarium: (id, data) =>
        set((s) => ({
          aquariums: s.aquariums.map((a) =>
            a.id === id ? { ...a, ...data, updated_at: nowStr() } : a
          ),
        })),
      removeAquarium: (id) =>
        set((s) => ({ aquariums: s.aquariums.filter((a) => a.id !== id) })),
      getAquarium: (id) => get().aquariums.find((a) => a.id === id),
    }),
    {
      name: "aquarium_data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
