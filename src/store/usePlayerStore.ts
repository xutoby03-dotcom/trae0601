import { create } from 'zustand';
import type { Player } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { mockPlayers } from '@/data/mockData';

interface PlayerState {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;
  loadPlayers: () => void;
}

const STORAGE_KEY = 'script-killer-players';

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],

  loadPlayers: () => {
    const stored = loadFromStorage<Player[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      set({ players: stored });
    } else {
      set({ players: mockPlayers });
      saveToStorage(STORAGE_KEY, mockPlayers);
    }
  },

  addPlayer: (player) => {
    const newPlayer: Player = {
      ...player,
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const players = [...get().players, newPlayer];
    set({ players });
    saveToStorage(STORAGE_KEY, players);
  },

  updatePlayer: (id, player) => {
    const players = get().players.map(p =>
      p.id === id ? { ...p, ...player } : p
    );
    set({ players });
    saveToStorage(STORAGE_KEY, players);
  },

  deletePlayer: (id) => {
    const players = get().players.filter(p => p.id !== id);
    set({ players });
    saveToStorage(STORAGE_KEY, players);
  },

  getPlayer: (id) => {
    return get().players.find(p => p.id === id);
  }
}));
