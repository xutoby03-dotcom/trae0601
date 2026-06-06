import { create } from 'zustand';
import { GameState, ThemeType, Skin, GameStats, GameRecord } from '@/types/game';

interface GameStore {
  gameState: GameState;
  currentTheme: ThemeType;
  currentSkin: Skin | null;
  stats: GameStats;
  totalCoins: number;
  bestDistance: number;
  showMenu: 'main' | 'shop' | 'leaderboard' | 'settings' | 'game';
  records: GameRecord[];
  bgmIndex: number;
  bgmVolume: number;
  soundEnabled: boolean;

  setGameState: (state: GameState) => void;
  setCurrentTheme: (theme: ThemeType) => void;
  setCurrentSkin: (skin: Skin | null) => void;
  setStats: (stats: GameStats) => void;
  setTotalCoins: (coins: number) => void;
  setBestDistance: (distance: number) => void;
  setShowMenu: (menu: 'main' | 'shop' | 'leaderboard' | 'settings' | 'game') => void;
  setRecords: (records: GameRecord[]) => void;
  setBgmIndex: (index: number) => void;
  setBgmVolume: (volume: number) => void;
  toggleSound: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  currentTheme: 'volcano',
  currentSkin: null,
  stats: { distance: 0, coins: 0, speed: 0, shieldTime: 0 },
  totalCoins: 0,
  bestDistance: 0,
  showMenu: 'main',
  records: [],
  bgmIndex: 0,
  bgmVolume: 0.3,
  soundEnabled: true,

  setGameState: (state) => set({ gameState: state }),
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setCurrentSkin: (skin) => set({ currentSkin: skin }),
  setStats: (stats) => set({ stats }),
  setTotalCoins: (coins) => set({ totalCoins: coins }),
  setBestDistance: (distance) => set({ bestDistance: distance }),
  setShowMenu: (menu) => set({ showMenu: menu }),
  setRecords: (records) => set({ records }),
  setBgmIndex: (index) => set({ bgmIndex: index }),
  setBgmVolume: (volume) => set({ bgmVolume: volume }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
