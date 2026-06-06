import { TowerConfig, TowerType } from '../types';

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  single: {
    type: 'single',
    name: '狙击塔',
    description: '高伤害单体攻击，射程远',
    baseCost: 50,
    color: '#00ff88',
    levels: [
      {
        damage: 25,
        range: 150,
        fireRate: 1.0,
        cost: 50,
        projectileSpeed: 400,
      },
      {
        damage: 50,
        range: 180,
        fireRate: 1.2,
        cost: 75,
        projectileSpeed: 500,
      },
      {
        damage: 100,
        range: 220,
        fireRate: 1.5,
        cost: 150,
        projectileSpeed: 600,
      },
    ],
  },
  aoe: {
    type: 'aoe',
    name: '爆破塔',
    description: '范围爆炸伤害，适合群体',
    baseCost: 80,
    color: '#ff4444',
    levels: [
      {
        damage: 15,
        range: 120,
        fireRate: 0.8,
        cost: 80,
        projectileSpeed: 300,
        aoeRadius: 60,
      },
      {
        damage: 30,
        range: 140,
        fireRate: 1.0,
        cost: 120,
        projectileSpeed: 350,
        aoeRadius: 80,
      },
      {
        damage: 60,
        range: 160,
        fireRate: 1.2,
        cost: 200,
        projectileSpeed: 400,
        aoeRadius: 100,
      },
    ],
  },
  ice: {
    type: 'ice',
    name: '冰霜塔',
    description: '减速敌人，控制能力强',
    baseCost: 60,
    color: '#44aaff',
    levels: [
      {
        damage: 8,
        range: 130,
        fireRate: 1.5,
        cost: 60,
        projectileSpeed: 350,
        slowAmount: 0.3,
        slowDuration: 2.0,
      },
      {
        damage: 15,
        range: 150,
        fireRate: 1.8,
        cost: 90,
        projectileSpeed: 400,
        slowAmount: 0.5,
        slowDuration: 2.5,
      },
      {
        damage: 25,
        range: 180,
        fireRate: 2.0,
        cost: 150,
        projectileSpeed: 450,
        slowAmount: 0.7,
        slowDuration: 3.0,
      },
    ],
  },
};

export const getTowerLevelConfig = (type: TowerType, level: number) => {
  return TOWER_CONFIGS[type].levels[level];
};

export const getTowerUpgradeCost = (type: TowerType, currentLevel: number) => {
  if (currentLevel >= 2) return null;
  return TOWER_CONFIGS[type].levels[currentLevel + 1].cost;
};

export const getTowerSellValue = (type: TowerType, level: number) => {
  const config = TOWER_CONFIGS[type];
  let totalCost = 0;
  for (let i = 0; i <= level; i++) {
    totalCost += config.levels[i].cost;
  }
  return Math.floor(totalCost * 0.6);
};
