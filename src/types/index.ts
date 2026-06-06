export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  exp: number;
  expToNext: number;
  gold: number;
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'key';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  stats?: Partial<PlayerStats>;
  healAmount?: number;
  mpRestore?: number;
  damage?: number;
  icon?: string;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
}

export interface Player {
  name: string;
  stats: PlayerStats;
  inventory: InventoryItem[];
  equipment: Equipment;
  flags: Record<string, boolean>;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  description: string;
  isBoss?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  damage: number;
  type: 'attack' | 'heal';
}

export interface DialogueOption {
  text: string;
  nextNodeId: string;
  requiresItem?: string;
  requiresFlag?: string;
  givesItem?: string;
  setsFlag?: string;
  startsBattle?: string;
  healsPlayer?: boolean;
  restMp?: boolean;
}

export interface SceneNode {
  id: string;
  title: string;
  description: string;
  background?: string;
  options: DialogueOption[];
  isEnding?: boolean;
  endingType?: 'good' | 'bad' | 'neutral' | 'hidden';
  autoSave?: boolean;
  giveItem?: string;
  setFlag?: string;
}

export type GameScreen = 'title' | 'game' | 'battle' | 'inventory' | 'save' | 'load' | 'gameover' | 'ending';

export interface BattleState {
  enemy: Enemy;
  turn: 'player' | 'enemy';
  log: string[];
  isActive: boolean;
  victory?: boolean;
  nextNodeId?: string;
}

export interface SaveSlot {
  id: number;
  player: Player;
  currentNodeId: string;
  timestamp: number;
  sceneTitle: string;
}

export interface GameState {
  screen: GameScreen;
  player: Player;
  currentNodeId: string;
  battle: BattleState | null;
  saves: SaveSlot[];
  message: string | null;
  currentEndingType?: 'good' | 'bad' | 'neutral' | 'hidden';
}
