import { create } from 'zustand';
import type { Equipment, Battery, MemoryCard, User, EquipmentKit, EquipmentType, EquipmentStatus } from '../types';
import { mockUsers, mockEquipment, mockEquipmentKits } from '../data/mockData';
import { saveToStorage, loadFromStorage, generateId } from '../utils/storage';

interface EquipmentState {
  users: User[];
  equipment: Equipment[];
  kits: EquipmentKit[];
  currentUser: User | null;
  isInitialized: boolean;

  init: () => void;
  setCurrentUser: (userId: string) => void;

  addEquipment: (equipment: Omit<Equipment, 'id' | 'batteries' | 'memoryCards'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;

  addBattery: (equipmentId: string, battery: Omit<Battery, 'id'>) => void;
  updateBattery: (equipmentId: string, batteryId: string, updates: Partial<Battery>) => void;
  deleteBattery: (equipmentId: string, batteryId: string) => void;
  updateBatteryChargeLevel: (equipmentId: string, batteryId: string, level: number) => void;

  addMemoryCard: (equipmentId: string, card: Omit<MemoryCard, 'id'>) => void;
  updateMemoryCard: (equipmentId: string, cardId: string, updates: Partial<MemoryCard>) => void;
  deleteMemoryCard: (equipmentId: string, cardId: string) => void;
  updateCardUsedCapacity: (equipmentId: string, cardId: string, usedCapacity: number) => void;
  formatMemoryCard: (equipmentId: string, cardId: string) => void;

  addKit: (kit: Omit<EquipmentKit, 'id'>) => void;
  updateKit: (id: string, updates: Partial<EquipmentKit>) => void;
  deleteKit: (id: string) => void;

  getEquipmentByType: (type: EquipmentType) => Equipment[];
  getAvailableEquipment: () => Equipment[];
  getUnchargedBatteries: () => Battery[];
  getOverCapacityCards: () => MemoryCard[];
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  users: [],
  equipment: [],
  kits: [],
  currentUser: null,
  isInitialized: false,

  init: () => {
    if (get().isInitialized) return;

    const savedUsers = loadFromStorage<User[]>('users');
    const savedEquipment = loadFromStorage<Equipment[]>('equipment');
    const savedKits = loadFromStorage<EquipmentKit[]>('kits');
    const savedCurrentUserId = loadFromStorage<string>('currentUser');

    const users = savedUsers || mockUsers;
    const equipment = savedEquipment || mockEquipment;
    const kits = savedKits || mockEquipmentKits;
    const currentUser = savedCurrentUserId ? users.find(u => u.id === savedCurrentUserId) || users[0] : users[0];

    set({
      users,
      equipment,
      kits,
      currentUser,
      isInitialized: true,
    });

    if (!savedUsers) saveToStorage('users', users);
    if (!savedEquipment) saveToStorage('equipment', equipment);
    if (!savedKits) saveToStorage('kits', kits);
    if (!savedCurrentUserId) saveToStorage('currentUser', currentUser.id);
  },

  setCurrentUser: (userId) => {
    const users = get().users;
    const user = users.find(u => u.id === userId);
    if (user) {
      set({ currentUser: user });
      saveToStorage('currentUser', userId);
    }
  },

  addEquipment: (equipmentData) => {
    const newEquipment: Equipment = {
      ...equipmentData,
      id: generateId('eq'),
      batteries: [],
      memoryCards: [],
    };
    const equipment = [...get().equipment, newEquipment];
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  updateEquipment: (id, updates) => {
    const equipment = get().equipment.map(eq =>
      eq.id === id ? { ...eq, ...updates } : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  deleteEquipment: (id) => {
    const equipment = get().equipment.filter(eq => eq.id !== id);
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  updateEquipmentStatus: (id, status) => {
    get().updateEquipment(id, { status });
  },

  addBattery: (equipmentId, batteryData) => {
    const newBattery: Battery = {
      ...batteryData,
      id: generateId('bat'),
    };
    const equipment = get().equipment.map(eq =>
      eq.id === equipmentId
        ? { ...eq, batteries: [...eq.batteries, newBattery] }
        : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  updateBattery: (equipmentId, batteryId, updates) => {
    const equipment = get().equipment.map(eq =>
      eq.id === equipmentId
        ? {
            ...eq,
            batteries: eq.batteries.map(bat =>
              bat.id === batteryId ? { ...bat, ...updates } : bat
            ),
          }
        : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  deleteBattery: (equipmentId, batteryId) => {
    const equipment = get().equipment.map(eq =>
      eq.id === equipmentId
        ? { ...eq, batteries: eq.batteries.filter(bat => bat.id !== batteryId) }
        : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  updateBatteryChargeLevel: (equipmentId, batteryId, level) => {
    get().updateBattery(equipmentId, batteryId, {
      chargeLevel: level,
      lastChargedAt: level >= 100 ? new Date().toISOString() : undefined,
    });
  },

  addMemoryCard: (equipmentId, cardData) => {
    const newCard: MemoryCard = {
      ...cardData,
      id: generateId('card'),
    };
    const equipment = get().equipment.map(eq =>
      eq.id === equipmentId
        ? { ...eq, memoryCards: [...eq.memoryCards, newCard] }
        : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  updateMemoryCard: (equipmentId, cardId, updates) => {
    const equipment = get().equipment.map(eq =>
      eq.id === equipmentId
        ? {
            ...eq,
            memoryCards: eq.memoryCards.map(card =>
              card.id === cardId ? { ...card, ...updates } : card
            ),
          }
        : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  deleteMemoryCard: (equipmentId, cardId) => {
    const equipment = get().equipment.map(eq =>
      eq.id === equipmentId
        ? { ...eq, memoryCards: eq.memoryCards.filter(card => card.id !== cardId) }
        : eq
    );
    set({ equipment });
    saveToStorage('equipment', equipment);
  },

  updateCardUsedCapacity: (equipmentId, cardId, usedCapacity) => {
    get().updateMemoryCard(equipmentId, cardId, { usedCapacity });
  },

  formatMemoryCard: (equipmentId, cardId) => {
    get().updateMemoryCard(equipmentId, cardId, { usedCapacity: 0 });
  },

  addKit: (kitData) => {
    const newKit: EquipmentKit = {
      ...kitData,
      id: generateId('kit'),
    };
    const kits = [...get().kits, newKit];
    set({ kits });
    saveToStorage('kits', kits);
  },

  updateKit: (id, updates) => {
    const kits = get().kits.map(kit =>
      kit.id === id ? { ...kit, ...updates } : kit
    );
    set({ kits });
    saveToStorage('kits', kits);
  },

  deleteKit: (id) => {
    const kits = get().kits.filter(kit => kit.id !== id);
    set({ kits });
    saveToStorage('kits', kits);
  },

  getEquipmentByType: (type) => {
    return get().equipment.filter(eq => eq.type === type);
  },

  getAvailableEquipment: () => {
    return get().equipment.filter(eq => eq.status === 'available');
  },

  getUnchargedBatteries: () => {
    const batteries: Battery[] = [];
    get().equipment.forEach(eq => {
      eq.batteries.forEach(bat => {
        if (bat.chargeLevel < 100) batteries.push(bat);
      });
    });
    return batteries;
  },

  getOverCapacityCards: () => {
    const cards: MemoryCard[] = [];
    get().equipment.forEach(eq => {
      eq.memoryCards.forEach(card => {
        const usagePercent = (card.usedCapacity / card.totalCapacity) * 100;
        if (usagePercent >= 80) cards.push(card);
      });
    });
    return cards;
  },
}));
