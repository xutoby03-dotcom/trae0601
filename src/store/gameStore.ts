import { create } from 'zustand';
import { GameState, Furniture, Staff, MenuItem, Customer, Position, CustomerState } from '@/types/game';
import { FURNITURE_DATA, STAFF_CANDIDATES, MENU_DATA, CUSTOMER_EMOJIS, GRID_SIZE } from '@/data/gameData';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialGrid = (): (Furniture | null)[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};

const createInitialFurniture = (): Furniture[] => {
  return Object.entries(FURNITURE_DATA).map(([type, data]) => ({
    ...data,
    id: `furniture_${type}_${generateId()}`,
    type: type as Furniture['type'],
    position: null,
  }));
};

const createInitialStaff = (): Staff[] => {
  return [];
};

const getStaffCandidates = (): Staff[] => {
  return STAFF_CANDIDATES.map((candidate, idx) => ({
    ...candidate,
    id: `staff_candidate_${idx}_${generateId()}`,
    hired: false,
  }));
};

const createInitialMenu = (): MenuItem[] => {
  return MENU_DATA.map(item => ({ ...item }));
};

const selectMenuItemsByPrice = (menu: MenuItem[], count: number): MenuItem[] => {
  const unlockedItems = menu.filter(m => m.unlocked);
  if (unlockedItems.length === 0) return [];
  
  const order: MenuItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const totalWeight = unlockedItems.reduce((sum, item) => {
      const priceRatio = item.currentPrice / item.basePrice;
      const weight = 1 / (priceRatio * priceRatio);
      return sum + Math.max(0.1, weight);
    }, 0);
    
    let random = Math.random() * totalWeight;
    let selected = unlockedItems[0];
    
    for (const item of unlockedItems) {
      const priceRatio = item.currentPrice / item.basePrice;
      const weight = 1 / (priceRatio * priceRatio);
      random -= Math.max(0.1, weight);
      if (random <= 0) {
        selected = item;
        break;
      }
    }
    
    order.push({ ...selected });
  }
  
  return order;
};

const createCustomer = (menu: MenuItem[]): Customer => {
  const orderCount = Math.floor(Math.random() * 2) + 1;
  const order = selectMenuItemsByPrice(menu, orderCount);

  return {
    id: `customer_${generateId()}`,
    state: 'entering',
    patience: 100,
    maxPatience: 100,
    satisfaction: 50,
    order,
    totalSpent: 0,
    waitTime: 0,
    position: { x: -1, y: Math.floor(Math.random() * GRID_SIZE) },
    emoji: CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
  };
};

interface GameStore extends GameState {
  selectFurniture: (furniture: Furniture | null) => void;
  placeFurniture: (x: number, y: number) => void;
  placeFurnitureById: (furnitureId: string, x: number, y: number) => void;
  removeFurniture: (x: number, y: number) => void;
  buyFurniture: (furnitureId: string) => void;
  
  hireStaff: (staffId: string) => void;
  fireStaff: (staffId: string) => void;
  
  updateMenuPrice: (menuItemId: string, price: number) => void;
  unlockMenuItem: (menuItemId: string) => void;
  
  startDay: () => void;
  endDay: () => void;
  tick: () => void;
  
  setGameSpeed: (speed: number) => void;
  togglePause: () => void;
  
  depositMoney: (amount: number) => void;
  withdrawMoney: (amount: number) => void;
  unlockFurniture: (furnitureType: string) => void;
  
  calculateSatisfaction: () => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'planning',
  day: 1,
  money: 1000,
  bankMoney: 0,
  satisfaction: 50,
  dailyRevenue: 0,
  dailyCost: 0,
  customersServed: 0,
  customersLost: 0,
  
  grid: createInitialGrid(),
  furnitureInventory: createInitialFurniture(),
  staff: createInitialStaff(),
  staffCandidates: getStaffCandidates(),
  menu: createInitialMenu(),
  
  customers: [],
  orderQueue: [],
  preparingOrders: [],
  
  gameSpeed: 1,
  isPaused: false,
  dayTick: 0,
  
  selectedFurniture: null,

  selectFurniture: (furniture) => set({ selectedFurniture: furniture }),

  placeFurniture: (x, y) => {
    const state = get();
    if (!state.selectedFurniture) return;
    
    const { grid, selectedFurniture, furnitureInventory } = state;
    if (grid[y][x]) return;
    
    const newGrid = grid.map(row => [...row]);
    const placedFurniture = { ...selectedFurniture, position: { x, y } };
    newGrid[y][x] = placedFurniture;
    
    const newInventory = furnitureInventory.filter(f => f.id !== selectedFurniture.id);
    
    const tempState = { ...state, grid: newGrid, furnitureInventory: newInventory };
    const calculateSatisfaction = () => {
      let totalBonus = 0;
      newGrid.forEach(row => {
        row.forEach(cell => {
          if (cell) {
            totalBonus += cell.satisfactionBonus;
          }
        });
      });
      return Math.min(100, 50 + totalBonus);
    };
    
    set({
      grid: newGrid,
      furnitureInventory: newInventory,
      selectedFurniture: null,
      satisfaction: calculateSatisfaction(),
    });
  },

  placeFurnitureById: (furnitureId, x, y) => {
    const state = get();
    const furniture = state.furnitureInventory.find(f => f.id === furnitureId);
    if (!furniture || state.grid[y][x]) return;
    
    const newGrid = state.grid.map(row => [...row]);
    const placedFurniture = { ...furniture, position: { x, y } };
    newGrid[y][x] = placedFurniture;
    
    const newInventory = state.furnitureInventory.filter(f => f.id !== furnitureId);
    
    const calculateSatisfaction = () => {
      let totalBonus = 0;
      newGrid.forEach(row => {
        row.forEach(cell => {
          if (cell) {
            totalBonus += cell.satisfactionBonus;
          }
        });
      });
      return Math.min(100, 50 + totalBonus);
    };
    
    set({
      grid: newGrid,
      furnitureInventory: newInventory,
      selectedFurniture: null,
      satisfaction: calculateSatisfaction(),
    });
  },

  removeFurniture: (x, y) => {
    const state = get();
    const { grid, furnitureInventory } = state;
    const furniture = grid[y][x];
    if (!furniture) return;
    
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = null;
    
    const removedFurniture = { ...furniture, position: null };
    
    const calculateSatisfaction = () => {
      let totalBonus = 0;
      newGrid.forEach(row => {
        row.forEach(cell => {
          if (cell) {
            totalBonus += cell.satisfactionBonus;
          }
        });
      });
      return Math.min(100, 50 + totalBonus);
    };
    
    set({
      grid: newGrid,
      furnitureInventory: [...furnitureInventory, removedFurniture],
      satisfaction: calculateSatisfaction(),
    });
  },

  buyFurniture: (furnitureId) => {
    const state = get();
    const furniture = state.furnitureInventory.find(f => f.id === furnitureId);
    if (!furniture || state.money < furniture.price) return;
    
    const newFurniture = {
      ...furniture,
      id: `furniture_${furniture.type}_${generateId()}`,
      position: null,
    };
    
    set({
      money: state.money - furniture.price,
      furnitureInventory: [...state.furnitureInventory, newFurniture],
    });
  },

  hireStaff: (staffId) => {
    const state = get();
    const candidate = state.staffCandidates.find(s => s.id === staffId);
    if (!candidate || state.money < candidate.hireCost) return;
    
    const existingSameType = state.staff.find(s => s.type === candidate.type);
    if (existingSameType) return;
    
    const newHire = { ...candidate, hired: true };
    const newCandidates = state.staffCandidates.filter(s => s.id !== staffId);
    
    set({
      money: state.money - candidate.hireCost,
      staff: [...state.staff, newHire],
      staffCandidates: newCandidates,
    });
  },

  fireStaff: (staffId) => {
    const state = get();
    const staffToFire = state.staff.find(s => s.id === staffId);
    if (!staffToFire) return;
    
    const newStaff = state.staff.filter(s => s.id !== staffId);
    const firedCandidate = { ...staffToFire, hired: false };
    
    set({
      staff: newStaff,
      staffCandidates: [...state.staffCandidates, firedCandidate],
    });
  },

  updateMenuPrice: (menuItemId, price) => {
    const state = get();
    const newMenu = state.menu.map(m => 
      m.id === menuItemId ? { ...m, currentPrice: Math.max(m.cost, price) } : m
    );
    set({ menu: newMenu });
  },

  unlockMenuItem: (menuItemId) => {
    const state = get();
    const menuItem = state.menu.find(m => m.id === menuItemId);
    if (!menuItem || menuItem.unlocked || state.bankMoney < menuItem.unlockCost) return;
    
    const newMenu = state.menu.map(m => 
      m.id === menuItemId ? { ...m, unlocked: true } : m
    );
    
    set({
      bankMoney: state.bankMoney - menuItem.unlockCost,
      menu: newMenu,
    });
  },

  startDay: () => {
    const state = get();
    const staffCost = state.staff.filter(s => s.hired).reduce((sum, s) => sum + s.salary, 0);
    
    set({
      phase: 'running',
      dailyRevenue: 0,
      dailyCost: staffCost,
      customersServed: 0,
      customersLost: 0,
      customers: [],
      orderQueue: [],
      preparingOrders: [],
      isPaused: false,
      dayTick: 0,
    });
  },

  endDay: () => {
    const state = get();
    const profit = state.dailyRevenue - state.dailyCost;
    const newMoney = state.money + profit;
    
    set({
      phase: 'settlement',
      money: newMoney,
      day: state.day + 1,
      isPaused: true,
    });
  },

  tick: () => {
    const state = get();
    if (state.phase !== 'running' || state.isPaused) return;
    
    let { customers, orderQueue, preparingOrders, dailyRevenue, dailyCost, customersServed, customersLost, money, satisfaction, dayTick } = state;
    
    dayTick += 1 * state.gameSpeed;
    
    if (dayTick >= 600) {
      get().endDay();
      return;
    }
    
    const chef = state.staff.find(s => s.type === 'chef' && s.hired);
    const cashier = state.staff.find(s => s.type === 'cashier' && s.hired);
    const waiter = state.staff.find(s => s.type === 'waiter' && s.hired);
    
    const chefSpeed = chef ? 1 + chef.skill * 0.3 : 1;
    const cashierSpeed = cashier ? 1 + cashier.skill * 0.3 : 1;
    const waiterBonus = waiter ? waiter.skill * 5 : 0;
    const baseSatisfaction = get().calculateSatisfaction();
    
    if (Math.random() < 0.03 * state.gameSpeed * (baseSatisfaction / 70)) {
      const newCustomer = createCustomer(state.menu);
      customers = [...customers, newCustomer];
    }
    
    const updatedCustomers = customers.map(customer => {
      const c = { ...customer };
      
      switch (c.state) {
        case 'entering':
          c.position = { x: 0, y: Math.floor(Math.random() * GRID_SIZE) };
          c.state = 'waiting_in_line';
          break;
          
        case 'waiting_in_line':
          c.patience -= 1 * state.gameSpeed;
          if (c.patience <= 0) {
            c.state = 'leaving';
            customersLost++;
            satisfaction = Math.max(0, satisfaction - 5);
          } else if (Math.random() < 0.1 * cashierSpeed * state.gameSpeed) {
            c.state = 'ordering';
          }
          break;
          
        case 'ordering':
          const orderTotal = c.order.reduce((sum, item) => sum + item.currentPrice, 0);
          const orderCost = c.order.reduce((sum, item) => sum + item.cost, 0);
          c.totalSpent = orderTotal;
          dailyRevenue += orderTotal;
          dailyCost += orderCost;
          c.satisfaction += waiterBonus + (baseSatisfaction - 50) * 0.5;
          
          orderQueue = [...orderQueue, { customerId: c.id, items: c.order }];
          c.state = 'waiting_food';
          break;
          
        case 'waiting_food':
          c.patience -= 0.5 * state.gameSpeed;
          c.waitTime += 1 * state.gameSpeed;
          if (c.patience <= 0) {
            c.state = 'leaving';
            customersLost++;
            satisfaction = Math.max(0, satisfaction - 3);
            orderQueue = orderQueue.filter(o => o.customerId !== c.id);
            preparingOrders = preparingOrders.filter(p => p.customerId !== c.id);
          }
          break;
          
        case 'eating':
          if (Math.random() < 0.1 * state.gameSpeed) {
            c.state = 'leaving';
            customersServed++;
            satisfaction = Math.min(100, satisfaction + 2 + waiterBonus + (baseSatisfaction - 50) * 0.2);
          }
          break;
          
        case 'leaving':
          break;
      }
      
      return c;
    });
    
    if (orderQueue.length > 0 && preparingOrders.length < 3) {
      const nextOrder = orderQueue[0];
      orderQueue = orderQueue.slice(1);
      preparingOrders = [...preparingOrders, { ...nextOrder, progress: 0, staffId: chef?.id }];
    }
    
    preparingOrders = preparingOrders.map(order => {
      const totalPrepTime = order.items.reduce((sum, item) => sum + item.prepTime, 0);
      const progressPerTick = (100 / totalPrepTime) * chefSpeed * state.gameSpeed;
      return { ...order, progress: Math.min(100, order.progress + progressPerTick) };
    });
    
    const completedOrders = preparingOrders.filter(p => p.progress >= 100);
    preparingOrders = preparingOrders.filter(p => p.progress < 100);
    
    completedOrders.forEach(order => {
      const customerIndex = updatedCustomers.findIndex(c => c.id === order.customerId);
      if (customerIndex !== -1) {
        updatedCustomers[customerIndex] = {
          ...updatedCustomers[customerIndex],
          state: 'eating',
          position: { x: 1 + Math.floor(Math.random() * (GRID_SIZE - 2)), y: Math.floor(Math.random() * GRID_SIZE) },
        };
      }
    });
    
    customers = updatedCustomers.filter(c => c.state !== 'leaving' || Math.random() > 0.1);
    
    set({
      customers,
      orderQueue,
      preparingOrders,
      dailyRevenue,
      dailyCost,
      customersServed,
      customersLost,
      money,
      satisfaction,
      dayTick,
    });
  },

  setGameSpeed: (speed) => set({ gameSpeed: speed }),

  togglePause: () => set(state => ({ isPaused: !state.isPaused })),

  depositMoney: (amount) => {
    const state = get();
    const depositAmount = Math.min(amount, state.money);
    set({
      money: state.money - depositAmount,
      bankMoney: state.bankMoney + depositAmount,
    });
  },

  withdrawMoney: (amount) => {
    const state = get();
    const withdrawAmount = Math.min(amount, state.bankMoney);
    set({
      money: state.money + withdrawAmount,
      bankMoney: state.bankMoney - withdrawAmount,
    });
  },

  unlockFurniture: (furnitureType) => {
    const state = get();
    const furnitureData = FURNITURE_DATA[furnitureType as keyof typeof FURNITURE_DATA];
    if (!furnitureData || furnitureData.unlocked || state.bankMoney < furnitureData.unlockCost) return;
    
    const newFurniture: Furniture = {
      ...furnitureData,
      id: `furniture_${furnitureType}_${generateId()}`,
      type: furnitureType as Furniture['type'],
      unlocked: true,
      position: null,
    };
    
    set({
      bankMoney: state.bankMoney - furnitureData.unlockCost,
      furnitureInventory: [...state.furnitureInventory, newFurniture],
    });
  },

  calculateSatisfaction: () => {
    const state = get();
    let totalBonus = 0;
    state.grid.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          totalBonus += cell.satisfactionBonus;
        }
      });
    });
    return Math.min(100, 50 + totalBonus);
  },
}));
