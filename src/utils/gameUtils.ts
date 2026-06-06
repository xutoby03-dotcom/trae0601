import { Player, Item, InventoryItem, Equipment, PlayerStats } from '../types';
import { ITEMS } from '../data/items';

export const createInitialPlayer = (name: string = '勇者'): Player => ({
  name,
  stats: {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
    speed: 10,
    level: 1,
    exp: 0,
    expToNext: 50,
    gold: 100,
  },
  inventory: [],
  equipment: {
    weapon: null,
    armor: null,
  },
  flags: {},
});

export const addItemToInventory = (
  inventory: InventoryItem[],
  itemId: string
): InventoryItem[] => {
  const item = ITEMS[itemId];
  if (!item) return inventory;

  const existingIndex = inventory.findIndex((i) => i.item.id === itemId);
  if (existingIndex >= 0) {
    const newInventory = [...inventory];
    newInventory[existingIndex] = {
      ...newInventory[existingIndex],
      quantity: newInventory[existingIndex].quantity + 1,
    };
    return newInventory;
  }

  return [...inventory, { item, quantity: 1 }];
};

export const removeItemFromInventory = (
  inventory: InventoryItem[],
  itemId: string,
  quantity: number = 1
): InventoryItem[] => {
  const existingIndex = inventory.findIndex((i) => i.item.id === itemId);
  if (existingIndex < 0) return inventory;

  const newInventory = [...inventory];
  const newQuantity = newInventory[existingIndex].quantity - quantity;

  if (newQuantity <= 0) {
    newInventory.splice(existingIndex, 1);
  } else {
    newInventory[existingIndex] = {
      ...newInventory[existingIndex],
      quantity: newQuantity,
    };
  }

  return newInventory;
};

export const hasItem = (inventory: InventoryItem[], itemId: string): boolean => {
  return inventory.some((i) => i.item.id === itemId && i.quantity > 0);
};

export const calculateTotalStats = (
  baseStats: PlayerStats,
  equipment: Equipment
): PlayerStats => {
  const stats = { ...baseStats };

  if (equipment.weapon?.stats) {
    Object.entries(equipment.weapon.stats).forEach(([key, value]) => {
      if (value && key in stats) {
        (stats as any)[key] += value;
      }
    });
  }

  if (equipment.armor?.stats) {
    Object.entries(equipment.armor.stats).forEach(([key, value]) => {
      if (value && key in stats) {
        (stats as any)[key] += value;
      }
    });
  }

  return stats;
};

export const equipItem = (
  equipment: Equipment,
  item: Item
): { equipment: Equipment; oldItem: Item | null } => {
  let oldItem: Item | null = null;

  if (item.type === 'weapon') {
    oldItem = equipment.weapon;
    return {
      equipment: { ...equipment, weapon: item },
      oldItem,
    };
  }

  if (item.type === 'armor') {
    oldItem = equipment.armor;
    return {
      equipment: { ...equipment, armor: item },
      oldItem,
    };
  }

  return { equipment, oldItem: null };
};

export const calculateDamage = (
  attackerAttack: number,
  defenderDefense: number
): number => {
  const baseDamage = Math.max(1, attackerAttack - defenderDefense);
  const variance = Math.floor(Math.random() * 5) - 2;
  return Math.max(1, baseDamage + variance);
};

export const checkLevelUp = (stats: PlayerStats): { stats: PlayerStats; leveledUp: boolean } => {
  if (stats.exp < stats.expToNext) {
    return { stats, leveledUp: false };
  }

  const newStats = { ...stats };
  let leveledUp = false;

  while (newStats.exp >= newStats.expToNext) {
    newStats.exp -= newStats.expToNext;
    newStats.level += 1;
    newStats.expToNext = Math.floor(newStats.expToNext * 1.5);
    newStats.maxHp += 20;
    newStats.hp = newStats.maxHp;
    newStats.maxMp += 10;
    newStats.mp = newStats.maxMp;
    newStats.attack += 3;
    newStats.defense += 2;
    newStats.speed += 1;
    leveledUp = true;
  }

  return { stats: newStats, leveledUp };
};

export const SAVE_KEY = 'text_rpg_saves';

export const loadSaves = (): any[] => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveSaves = (saves: any[]): void => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
  } catch (e) {
    console.error('Failed to save:', e);
  }
};
