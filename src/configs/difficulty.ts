import { DifficultyConfig, Difficulty } from '../types';

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: '简单',
    startingGold: 300,
    startingLives: 20,
    monsterHpMultiplier: 0.8,
    monsterSpeedMultiplier: 0.9,
    goldMultiplier: 1.2,
  },
  normal: {
    name: '普通',
    startingGold: 200,
    startingLives: 15,
    monsterHpMultiplier: 1.0,
    monsterSpeedMultiplier: 1.0,
    goldMultiplier: 1.0,
  },
  hard: {
    name: '困难',
    startingGold: 150,
    startingLives: 10,
    monsterHpMultiplier: 1.5,
    monsterSpeedMultiplier: 1.2,
    goldMultiplier: 0.8,
  },
};
