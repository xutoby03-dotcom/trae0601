export interface Point {
  x: number;
  y: number;
}

export type TowerType = 'single' | 'aoe' | 'ice';
export type MonsterType = 'normal' | 'armored' | 'flying' | 'boss';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'won' | 'lost';
export type EffectType = 'explosion' | 'hit' | 'slow' | 'build';

export interface DifficultyConfig {
  name: string;
  startingGold: number;
  startingLives: number;
  monsterHpMultiplier: number;
  monsterSpeedMultiplier: number;
  goldMultiplier: number;
}

export interface MapConfig {
  id: string;
  name: string;
  difficulty: Difficulty;
  path: Point[];
  towerSlots: Point[];
  background: string;
  pathColor: string;
}

export interface TowerLevelConfig {
  damage: number;
  range: number;
  fireRate: number;
  cost: number;
  projectileSpeed: number;
  aoeRadius?: number;
  slowAmount?: number;
  slowDuration?: number;
}

export interface TowerConfig {
  type: TowerType;
  name: string;
  description: string;
  baseCost: number;
  color: string;
  levels: TowerLevelConfig[];
}

export interface MonsterConfig {
  type: MonsterType;
  name: string;
  hp: number;
  speed: number;
  reward: number;
  armor: number;
  color: string;
  size: number;
  isFlying: boolean;
}

export interface WaveMonster {
  type: MonsterType;
  count: number;
  interval: number;
}

export interface WaveConfig {
  waveNumber: number;
  monsters: WaveMonster[];
  delay: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  level: number;
  x: number;
  y: number;
  slotIndex: number;
  lastFireTime: number;
  angle: number;
}

export interface Monster {
  id: string;
  type: MonsterType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  baseSpeed: number;
  pathIndex: number;
  progress: number;
  slowTimer: number;
  slowAmount: number;
  reward: number;
  armor: number;
  isFlying: boolean;
  size: number;
  color: string;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  damage: number;
  speed: number;
  type: TowerType;
  aoeRadius?: number;
  slowAmount?: number;
  slowDuration?: number;
  color: string;
}

export interface Effect {
  id: string;
  type: EffectType;
  x: number;
  y: number;
  duration: number;
  elapsed: number;
  radius?: number;
  color?: string;
}

export interface GameState {
  status: GameStatus;
  gold: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  waveInProgress: boolean;
  waveTimer: number;
  spawnTimer: number;
  spawnQueue: { type: MonsterType; delay: number }[];
  speed: 1 | 2 | 3;
  selectedTowerType: TowerType | null;
  selectedTower: Tower | null;
  towers: Tower[];
  monsters: Monster[];
  projectiles: Projectile[];
  effects: Effect[];
  map: MapConfig | null;
  difficulty: Difficulty;
  monstersKilled: number;
  totalDamageDealt: number;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { map: MapConfig; difficulty: Difficulty } }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'SET_SPEED'; payload: 1 | 2 | 3 }
  | { type: 'SELECT_TOWER_TYPE'; payload: TowerType | null }
  | { type: 'SELECT_TOWER'; payload: Tower | null }
  | { type: 'BUILD_TOWER'; payload: { slotIndex: number; type: TowerType } }
  | { type: 'UPGRADE_TOWER'; payload: { towerId: string } }
  | { type: 'SELL_TOWER'; payload: { towerId: string } }
  | { type: 'TICK'; payload: { deltaTime: number } }
  | { type: 'RESET_GAME' }
  | { type: 'GAME_OVER'; payload: { won: boolean } };
