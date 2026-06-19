import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player } from "@/types";
import { mockPlayers } from "@/data/mock";

interface PlayerStore {
  players: Player[];
  addPlayer: (player: Omit<Player, "id" | "createdAt">) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      players: mockPlayers,

      addPlayer: (player) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              ...player,
              id: `p_${Date.now()}`,
              createdAt: new Date().toISOString().split("T")[0],
            },
          ],
        })),

      updatePlayer: (id, updates) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      getPlayerById: (id) => get().players.find((p) => p.id === id),
    }),
    { name: "escape-room-players" }
  )
);
