import { ThemeType, ThemeColors, GameConfig } from '@/types/game';

export const themeColors: Record<ThemeType, ThemeColors> = {
  volcano: {
    skyTop: '#1a0a00',
    skyBottom: '#ff4500',
    ground: '#8B4513',
    groundDark: '#5D2E0C',
    accent: '#FF6B35',
    particle: '#FF4500',
  },
  snow: {
    skyTop: '#1e3a5f',
    skyBottom: '#87CEEB',
    ground: '#E8F4F8',
    groundDark: '#B8D4E3',
    accent: '#00BFFF',
    particle: '#FFFFFF',
  },
  space: {
    skyTop: '#0a0a1a',
    skyBottom: '#1a0a2e',
    ground: '#2D1B4E',
    groundDark: '#1a0f2e',
    accent: '#9D4EDD',
    particle: '#E0AAFF',
  },
};

export const themeNames: Record<ThemeType, string> = {
  volcano: '火山',
  snow: '雪山',
  space: '太空',
};

export const themeDifficulty: Record<ThemeType, number> = {
  volcano: 1,
  snow: 1.3,
  space: 1.6,
};

export const defaultConfig: GameConfig = {
  gravity: 0.8,
  jumpForce: -15,
  baseSpeed: 6,
  speedIncrement: 0.001,
  groundHeight: 100,
  playerX: 150,
};
