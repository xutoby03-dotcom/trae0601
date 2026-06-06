import { FishConfig, DecorationConfig, FishType, DecorationType } from '../store/types';

export const FISH_CONFIGS: Record<FishType, FishConfig> = {
  goldfish: {
    name: '金鱼',
    price: 50,
    size: 'small',
    colors: ['#FF6B35', '#FF8C42', '#FFD93D'],
    speed: 1.5,
    hungerRate: 0.8,
    eggValue: 5,
    emoji: '🐠',
  },
  guppy: {
    name: '孔雀鱼',
    price: 80,
    size: 'small',
    colors: ['#FF6B9D', '#4ECDC4', '#FFE66D', '#95E1D3'],
    speed: 2.5,
    hungerRate: 1.2,
    eggValue: 8,
    emoji: '🐟',
  },
  betta: {
    name: '斗鱼',
    price: 150,
    size: 'medium',
    colors: ['#3B82F6', '#EF4444', '#8B5CF6'],
    speed: 1.8,
    hungerRate: 1.0,
    eggValue: 15,
    emoji: '🐡',
  },
  clownfish: {
    name: '小丑鱼',
    price: 200,
    size: 'medium',
    colors: ['#FF6B35', '#FFFFFF', '#1E3A5F'],
    speed: 2.2,
    hungerRate: 1.0,
    eggValue: 20,
    emoji: '🐠',
  },
  butterflyCarp: {
    name: '蝴蝶鲤',
    price: 500,
    size: 'large',
    colors: ['#FFFFFF', '#E5E7EB', '#F3F4F6'],
    speed: 1.0,
    hungerRate: 0.6,
    eggValue: 50,
    emoji: '🐋',
  },
  octopus: {
    name: '章鱼',
    price: 800,
    size: 'large',
    colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
    speed: 1.5,
    hungerRate: 1.8,
    eggValue: 80,
    emoji: '🐙',
  },
};

export const DECORATION_CONFIGS: Record<DecorationType, DecorationConfig> = {
  seaweed1: { name: '小水草', price: 20, emoji: '🌿', width: 30, height: 50 },
  seaweed2: { name: '中水草', price: 35, emoji: '🌿', width: 40, height: 80 },
  seaweed3: { name: '大水草', price: 50, emoji: '🌿', width: 50, height: 110 },
  coral1: { name: '红珊瑚', price: 80, emoji: '🪸', width: 60, height: 50 },
  coral2: { name: '蓝珊瑚', price: 100, emoji: '🪸', width: 70, height: 60 },
  rock1: { name: '小石头', price: 15, emoji: '🪨', width: 30, height: 20 },
  rock2: { name: '中石头', price: 25, emoji: '🪨', width: 45, height: 30 },
  rock3: { name: '大石头', price: 40, emoji: '🪨', width: 60, height: 40 },
  shipwreck: { name: '沉船', price: 200, emoji: '🚢', width: 100, height: 60 },
  submarine: { name: '潜艇', price: 250, emoji: '🚤', width: 80, height: 40 },
  treasure: { name: '宝箱', price: 150, emoji: '📦', width: 50, height: 40 },
  shell1: { name: '小贝壳', price: 10, emoji: '🐚', width: 25, height: 20 },
  shell2: { name: '大贝壳', price: 20, emoji: '🐚', width: 40, height: 30 },
  pipe: { name: '水管', price: 60, emoji: '🔧', width: 50, height: 70 },
};

export const TANK_WIDTH = 960;
export const TANK_HEIGHT = 540;
export const SAND_HEIGHT = 60;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HUNGER_DECAY_PER_DAY = 15;
export const MOOD_DECAY_PER_DAY = 10;
export const HEALTH_RECOVERY_RATE = 0.5;
export const HEALTH_DECAY_RATE = 2;

export const INITIAL_COINS = 200;
export const INITIAL_TANK_LEVEL = 1;
