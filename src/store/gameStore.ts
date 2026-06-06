import { create } from 'zustand';
import { GameState, Fish, FishType, Decoration, DecorationType, Food, Egg } from './types';
import { FISH_CONFIGS, DECORATION_CONFIGS, DAY_MS, HUNGER_DECAY_PER_DAY, MOOD_DECAY_PER_DAY, HEALTH_DECAY_RATE, getTankWidth, getTankHeight, SAND_HEIGHT } from '../utils/constants';
import { saveGameState, loadGameState, createInitialState } from '../db/indexedDB';

interface GameActions {
  initialize: () => Promise<void>;
  addFish: (type: FishType, x: number, y: number) => void;
  removeFish: (id: string) => void;
  addDecoration: (type: DecorationType, x: number, y: number) => void;
  removeDecoration: (id: string) => void;
  moveDecoration: (id: string, x: number, y: number) => void;
  feed: (x?: number, y?: number) => void;
  selectFish: (id: string | null) => void;
  setShopTab: (tab: 'fish' | 'decoration') => void;
  updateFish: (id: string, updates: Partial<Fish>) => void;
  updateFood: (id: string, updates: Partial<Food>) => void;
  removeFood: (id: string) => void;
  collectEgg: (id: string) => void;
  processOfflineTime: () => void;
  dailySettle: () => void;
  save: () => void;
  upgradeTank: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createFish(type: FishType, x: number, y: number): Fish {
  const config = FISH_CONFIGS[type];
  return {
    id: generateId(),
    type,
    x,
    y,
    vx: (Math.random() - 0.5) * config.speed,
    vy: (Math.random() - 0.5) * config.speed * 0.5,
    targetX: x,
    targetY: y,
    hunger: 80,
    mood: 80,
    health: 100,
    birthTime: Date.now(),
    size: config.size,
    speed: config.speed,
    facingRight: Math.random() > 0.5,
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...createInitialState(),

  initialize: async () => {
    const savedState = await loadGameState();
    if (savedState) {
      set(savedState);
      get().processOfflineTime();
    }
  },

  addFish: (type: FishType, x: number, y: number) => {
    const state = get();
    const config = FISH_CONFIGS[type];
    if (state.coins < config.price) return;

    const fish = createFish(type, x, y);
    set((s) => ({
      coins: s.coins - config.price,
      fish: [...s.fish, fish],
    }));
    get().save();
  },

  removeFish: (id: string) => {
    set((s) => ({
      fish: s.fish.filter((f) => f.id !== id),
      selectedFishId: s.selectedFishId === id ? null : s.selectedFishId,
    }));
    get().save();
  },

  addDecoration: (type: DecorationType, x: number, y: number) => {
    const state = get();
    const config = DECORATION_CONFIGS[type];
    if (state.coins < config.price) return;

    const decoration: Decoration = {
      id: generateId(),
      type,
      x,
      y,
    };
    set((s) => ({
      coins: s.coins - config.price,
      decorations: [...s.decorations, decoration],
    }));
    get().save();
  },

  removeDecoration: (id: string) => {
    set((s) => ({
      decorations: s.decorations.filter((d) => d.id !== id),
    }));
    get().save();
  },

  moveDecoration: (id: string, x: number, y: number) => {
    set((s) => ({
      decorations: s.decorations.map((d) =>
        d.id === id ? { ...d, x, y } : d
      ),
    }));
  },

  feed: (x?: number, y?: number) => {
    const state = get();
    const tankWidth = getTankWidth(state.tankLevel);
    const tankHeight = getTankHeight(state.tankLevel);
    
    const foodCount = 5;
    const foods: Food[] = [];
    const baseX = x ?? tankWidth / 2;
    const startY = y ?? 10;
    
    for (let i = 0; i < foodCount; i++) {
      foods.push({
        id: generateId(),
        x: baseX + (Math.random() - 0.5) * 100,
        y: startY,
        targetY: tankHeight - SAND_HEIGHT - 10,
        eaten: false,
      });
    }
    set((s) => ({
      food: [...s.food, ...foods],
    }));
  },

  selectFish: (id: string | null) => {
    set({ selectedFishId: id });
  },

  setShopTab: (tab: 'fish' | 'decoration') => {
    set({ shopTab: tab });
  },

  updateFish: (id: string, updates: Partial<Fish>) => {
    set((s) => ({
      fish: s.fish.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  updateFood: (id: string, updates: Partial<Food>) => {
    set((s) => ({
      food: s.food.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  removeFood: (id: string) => {
    set((s) => ({
      food: s.food.filter((f) => f.id !== id),
    }));
  },

  collectEgg: (id: string) => {
    const state = get();
    const egg = state.eggs.find((e) => e.id === id);
    if (!egg) return;

    set((s) => ({
      coins: s.coins + egg.value,
      eggs: s.eggs.filter((e) => e.id !== id),
    }));
    get().save();
  },

  processOfflineTime: () => {
    const state = get();
    const now = Date.now();
    const offlineMs = now - state.lastLoginTime;
    const offlineDays = offlineMs / DAY_MS;

    if (offlineDays <= 0) {
      set({ lastLoginTime: now });
      return;
    }

    const updatedFish = state.fish.map((fish) => {
      const config = FISH_CONFIGS[fish.type];
      const hungerDecay = HUNGER_DECAY_PER_DAY * offlineDays * config.hungerRate;
      const moodDecay = MOOD_DECAY_PER_DAY * offlineDays;
      const newHunger = Math.max(0, fish.hunger - hungerDecay);
      const newMood = Math.max(0, fish.mood - moodDecay);
      
      let newHealth = fish.health;
      if (newHunger < 30 || newMood < 30) {
        newHealth = Math.max(0, newHealth - HEALTH_DECAY_RATE * offlineDays);
      }

      return {
        ...fish,
        hunger: newHunger,
        mood: newMood,
        health: newHealth,
      };
    }).filter((fish) => fish.health > 0);

    const tankWidth = getTankWidth(state.tankLevel);
    const tankHeight = getTankHeight(state.tankLevel);
    const daysSinceSettle = Math.floor((now - state.lastSettleTime) / DAY_MS);
    
    const newEggs: Egg[] = [];
    if (daysSinceSettle > 0) {
      updatedFish.forEach((fish) => {
        if (fish.health >= 50) {
          const config = FISH_CONFIGS[fish.type];
          const eggValue = Math.floor(config.eggValue * (fish.health / 100) * daysSinceSettle);
          if (eggValue > 0) {
            newEggs.push({
              id: generateId(),
              x: 50 + Math.random() * (tankWidth - 100),
              y: tankHeight - SAND_HEIGHT / 2 - 10,
              value: eggValue,
              fishType: fish.type,
            });
          }
        }
      });
    }

    set({
      fish: updatedFish,
      eggs: [...state.eggs, ...newEggs],
      lastLoginTime: now,
      lastSettleTime: daysSinceSettle > 0 ? now : state.lastSettleTime,
    });
    get().save();
  },

  dailySettle: () => {
    const state = get();
    const now = Date.now();
    const tankWidth = getTankWidth(state.tankLevel);
    const tankHeight = getTankHeight(state.tankLevel);

    const newEggs: Egg[] = [];
    
    const updatedFish = state.fish.map((fish) => {
      const config = FISH_CONFIGS[fish.type];
      
      if (fish.health >= 50) {
        const eggValue = Math.floor(config.eggValue * (fish.health / 100));
        if (eggValue > 0) {
          newEggs.push({
            id: generateId(),
            x: 50 + Math.random() * (tankWidth - 100),
            y: tankHeight - SAND_HEIGHT / 2 - 10,
            value: eggValue,
            fishType: fish.type,
          });
        }
      }

      const newHunger = Math.max(0, fish.hunger - HUNGER_DECAY_PER_DAY * config.hungerRate);
      const newMood = Math.max(0, fish.mood - MOOD_DECAY_PER_DAY);
      
      let newHealth = fish.health;
      if (newHunger < 30 || newMood < 30) {
        newHealth = Math.max(0, newHealth - HEALTH_DECAY_RATE);
      } else if (newHunger > 70 && newMood > 70) {
        newHealth = Math.min(100, newHealth + 0.5);
      }

      return {
        ...fish,
        hunger: newHunger,
        mood: newMood,
        health: newHealth,
      };
    }).filter((fish) => fish.health > 0);

    set({
      fish: updatedFish,
      eggs: [...state.eggs, ...newEggs],
      lastSettleTime: now,
    });
    get().save();
  },

  save: () => {
    const state = get();
    saveGameState(state);
  },

  upgradeTank: () => {
    const state = get();
    const cost = state.tankLevel * 500;
    if (state.coins >= cost) {
      set((s) => ({
        coins: s.coins - cost,
        tankLevel: s.tankLevel + 1,
      }));
      get().save();
    }
  },
}));
