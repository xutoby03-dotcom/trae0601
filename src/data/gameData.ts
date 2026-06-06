import { Furniture, Staff, MenuItem, FurnitureType, StaffType } from '@/types/game';

export const FURNITURE_DATA: Record<FurnitureType, Omit<Furniture, 'id' | 'position'>> = {
  table: {
    type: 'table',
    name: '餐桌',
    price: 100,
    satisfactionBonus: 5,
    capacity: 2,
    unlocked: true,
    unlockCost: 0,
    emoji: '🪑',
  },
  chair: {
    type: 'chair',
    name: '椅子',
    price: 50,
    satisfactionBonus: 3,
    unlocked: true,
    unlockCost: 0,
    emoji: '💺',
  },
  counter: {
    type: 'counter',
    name: '收银台',
    price: 200,
    satisfactionBonus: 10,
    unlocked: true,
    unlockCost: 0,
    emoji: '🏪',
  },
  coffee_machine: {
    type: 'coffee_machine',
    name: '咖啡机',
    price: 500,
    satisfactionBonus: 15,
    unlocked: true,
    unlockCost: 0,
    emoji: '☕',
  },
  cake_display: {
    type: 'cake_display',
    name: '蛋糕柜',
    price: 300,
    satisfactionBonus: 12,
    unlocked: false,
    unlockCost: 1000,
    emoji: '🍰',
  },
  decoration: {
    type: 'decoration',
    name: '装饰画',
    price: 80,
    satisfactionBonus: 8,
    unlocked: false,
    unlockCost: 500,
    emoji: '🖼️',
  },
};

export const STAFF_CANDIDATES: Omit<Staff, 'id' | 'hired'>[] = [
  { type: 'cashier', name: '小明', salary: 80, skill: 1, hireCost: 150, emoji: '👦', description: '新手收银员，速度一般' },
  { type: 'cashier', name: '小红', salary: 120, skill: 2, hireCost: 300, emoji: '👩', description: '熟练收银员，点餐较快' },
  { type: 'cashier', name: '老王', salary: 180, skill: 3, hireCost: 500, emoji: '👨', description: '资深收银员，闪电速度' },
  
  { type: 'waiter', name: '小李', salary: 100, skill: 1, hireCost: 200, emoji: '🧑', description: '新手服务员，态度友好' },
  { type: 'waiter', name: '小美', salary: 150, skill: 2, hireCost: 400, emoji: '👧', description: '熟练服务员，顾客满意' },
  { type: 'waiter', name: '阿花', salary: 220, skill: 3, hireCost: 600, emoji: '👵', description: '金牌服务员，五星好评' },
  
  { type: 'chef', name: '阿强', salary: 130, skill: 1, hireCost: 250, emoji: '👨‍🍳', description: '新手咖啡师，手艺尚可' },
  { type: 'chef', name: '阿杰', salary: 190, skill: 2, hireCost: 450, emoji: '🧑‍🍳', description: '熟练咖啡师，出品稳定' },
  { type: 'chef', name: '大师', salary: 280, skill: 3, hireCost: 700, emoji: '👨‍🍳', description: '咖啡大师，赛过星巴克' },
];

export const MENU_DATA: MenuItem[] = [
  { id: 'espresso', type: 'coffee', name: '意式浓缩', cost: 5, basePrice: 15, currentPrice: 15, unlocked: true, unlockCost: 0, prepTime: 3, emoji: '☕' },
  { id: 'americano', type: 'coffee', name: '美式咖啡', cost: 6, basePrice: 18, currentPrice: 18, unlocked: true, unlockCost: 0, prepTime: 4, emoji: '☕' },
  { id: 'latte', type: 'coffee', name: '拿铁', cost: 8, basePrice: 25, currentPrice: 25, unlocked: true, unlockCost: 0, prepTime: 5, emoji: '🥛' },
  { id: 'cappuccino', type: 'coffee', name: '卡布奇诺', cost: 9, basePrice: 28, currentPrice: 28, unlocked: false, unlockCost: 500, prepTime: 6, emoji: '☕' },
  { id: 'mocha', type: 'coffee', name: '摩卡', cost: 10, basePrice: 32, currentPrice: 32, unlocked: false, unlockCost: 800, prepTime: 7, emoji: '🍫' },
  { id: 'tiramisu', type: 'dessert', name: '提拉米苏', cost: 12, basePrice: 35, currentPrice: 35, unlocked: true, unlockCost: 0, prepTime: 4, emoji: '🍰' },
  { id: 'cheesecake', type: 'dessert', name: '芝士蛋糕', cost: 10, basePrice: 30, currentPrice: 30, unlocked: true, unlockCost: 0, prepTime: 3, emoji: '🧀' },
  { id: 'macaron', type: 'dessert', name: '马卡龙', cost: 8, basePrice: 25, currentPrice: 25, unlocked: false, unlockCost: 600, prepTime: 2, emoji: '🍪' },
];

export const CUSTOMER_EMOJIS = ['👤', '👩', '👨', '👧', '👦', '🧑', '👴', '👵'];

export const GRID_SIZE = 4;
