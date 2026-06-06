export type FishType = 'goldfish' | 'guppy' | 'betta' | 'clownfish' | 'butterflyCarp' | 'octopus';

export type DecorationType =
  | 'seaweed1' | 'seaweed2' | 'seaweed3'
  | 'coral1' | 'coral2'
  | 'rock1' | 'rock2' | 'rock3'
  | 'shipwreck' | 'submarine' | 'treasure'
  | 'shell1' | 'shell2' | 'pipe';

export interface Fish {
  id: string;
  type: FishType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  hunger: number;
  mood: number;
  health: number;
  birthTime: number;
  size: 'small' | 'medium' | 'large';
  speed: number;
  facingRight: boolean;
  wobblePhase: number;
}

export interface Decoration {
  id: string;
  type: DecorationType;
  x: number;
  y: number;
}

export interface Food {
  id: string;
  x: number;
  y: number;
  targetY: number;
  eaten: boolean;
}

export interface Egg {
  id: string;
  x: number;
  y: number;
  value: number;
  fishType: FishType;
}

export interface FishConfig {
  name: string;
  price: number;
  size: 'small' | 'medium' | 'large';
  colors: string[];
  speed: number;
  hungerRate: number;
  eggValue: number;
  emoji: string;
}

export interface DecorationConfig {
  name: string;
  price: number;
  emoji: string;
  width: number;
  height: number;
}

export interface GameState {
  coins: number;
  tankLevel: number;
  fish: Fish[];
  decorations: Decoration[];
  food: Food[];
  eggs: Egg[];
  lastLoginTime: number;
  lastSettleTime: number;
  selectedFishId: string | null;
  shopTab: 'fish' | 'decoration';
}
