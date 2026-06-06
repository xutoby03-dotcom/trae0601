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

export const STAFF_DATA: Record<StaffType, Omit<Staff, 'id'>> = {
  cashier: {
    type: 'cashier',
    name: '收银员',
    salary: 100,
    skill: 1,
    hired: false,
    hireCost: 200,
    emoji: '💁',
    description: '加快点餐速度',
  },
  waiter: {
    type: 'waiter',
    name: '服务员',
    salary: 120,
    skill: 1,
    hired: false,
    hireCost: 250,
    emoji: '🧑‍🍳',
    description: '加快上菜速度，提升满意度',
  },
  chef: {
    type: 'chef',
    name: '咖啡师',
    salary: 150,
    skill: 1,
    hired: false,
    hireCost: 300,
    emoji: '👨‍🍳',
    description: '加快制作速度',
  },
};

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
