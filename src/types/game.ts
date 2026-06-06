export type FurnitureType = 'table' | 'chair' | 'counter' | 'coffee_machine' | 'cake_display' | 'decoration';
export type StaffType = 'cashier' | 'waiter' | 'chef';
export type CustomerState = 'entering' | 'waiting_in_line' | 'ordering' | 'waiting_food' | 'eating' | 'leaving';
export type MenuItemType = 'coffee' | 'dessert';
export type GamePhase = 'planning' | 'running' | 'settlement';

export interface Position {
  x: number;
  y: number;
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  name: string;
  price: number;
  satisfactionBonus: number;
  capacity?: number;
  position: Position | null;
  unlocked: boolean;
  unlockCost: number;
  emoji: string;
}

export interface Staff {
  id: string;
  type: StaffType;
  name: string;
  salary: number;
  skill: number;
  hired: boolean;
  hireCost: number;
  emoji: string;
  description: string;
}

export interface MenuItem {
  id: string;
  type: MenuItemType;
  name: string;
  cost: number;
  basePrice: number;
  currentPrice: number;
  unlocked: boolean;
  unlockCost: number;
  prepTime: number;
  emoji: string;
}

export interface Customer {
  id: string;
  state: CustomerState;
  patience: number;
  maxPatience: number;
  satisfaction: number;
  order: MenuItem[];
  totalSpent: number;
  waitTime: number;
  position: Position;
  emoji: string;
}

export interface GameState {
  phase: GamePhase;
  day: number;
  money: number;
  bankMoney: number;
  satisfaction: number;
  dailyRevenue: number;
  dailyCost: number;
  customersServed: number;
  customersLost: number;
  
  grid: (Furniture | null)[][];
  furnitureInventory: Furniture[];
  staff: Staff[];
  staffCandidates: Staff[];
  menu: MenuItem[];
  
  customers: Customer[];
  orderQueue: { customerId: string; items: MenuItem[] }[];
  preparingOrders: { customerId: string; items: MenuItem[]; progress: number; staffId?: string }[];
  
  gameSpeed: number;
  isPaused: boolean;
  dayTick: number;
  
  selectedFurniture: Furniture | null;
}
