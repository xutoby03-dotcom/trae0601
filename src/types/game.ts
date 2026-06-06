export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type ThemeType = 'volcano' | 'snow' | 'space';
export type PlayerState = 'running' | 'jumping' | 'sliding';
export type ObstacleType = 'pit' | 'high' | 'platform' | 'blade';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  state: PlayerState;
  skin: string;
  isOnGround: boolean;
  slideTimer: number;
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX?: number;
  rotation?: number;
  platformDirection?: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  animationFrame: number;
}

export interface Shield {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  animationFrame: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Skin {
  id: string;
  name: string;
  price: number;
  colors: {
    body: string;
    accent: string;
  };
  owned: boolean;
  equipped: boolean;
}

export interface GameRecord {
  id?: number;
  distance: number;
  coins: number;
  theme: ThemeType;
  timestamp: number;
}

export interface GameConfig {
  gravity: number;
  jumpForce: number;
  baseSpeed: number;
  speedIncrement: number;
  groundHeight: number;
  playerX: number;
}

export interface ThemeColors {
  skyTop: string;
  skyBottom: string;
  ground: string;
  groundDark: string;
  accent: string;
  particle: string;
}

export interface GameStats {
  distance: number;
  coins: number;
  speed: number;
  shieldTime: number;
}
