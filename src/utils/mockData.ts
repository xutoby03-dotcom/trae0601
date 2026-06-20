import type { Toy, CleaningRecord, DisinfectionTask, AlertItem } from '@/types';
import { addDaysToISO, generateId } from './constants';

const now = new Date();
const iso = (offsetDays: number, hour = 10) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const mockToys: Toy[] = [
  {
    id: 'toy-1',
    name: '硅胶咬咬乐牙胶',
    material: 'silicone',
    ageRange: '0-1岁',
    cleanMethod: 'water_wipe',
    purchaseDate: iso(-180),
    storageLocation: '客厅收纳箱A',
    photo: null,
    createdAt: iso(-180),
    updatedAt: iso(-3),
  },
  {
    id: 'toy-2',
    name: '榉木积木套装（60粒）',
    material: 'wood',
    ageRange: '1-3岁',
    cleanMethod: 'wipe',
    purchaseDate: iso(-240),
    storageLocation: '客厅收纳箱A',
    photo: null,
    createdAt: iso(-240),
    updatedAt: iso(-7),
  },
  {
    id: 'toy-3',
    name: '毛绒安抚熊（大号）',
    material: 'plush',
    ageRange: '0-6个月',
    cleanMethod: 'water',
    purchaseDate: iso(-300),
    storageLocation: '卧室玩具架',
    photo: null,
    createdAt: iso(-300),
    updatedAt: iso(-10),
  },
  {
    id: 'toy-4',
    name: '软胶洗澡玩具套装',
    material: 'rubber',
    ageRange: '6-12个月',
    cleanMethod: 'water_wipe',
    purchaseDate: iso(-120),
    storageLocation: '浴室玩具篮',
    photo: null,
    createdAt: iso(-120),
    updatedAt: iso(-2),
  },
  {
    id: 'toy-5',
    name: '塑料轨道小汽车',
    material: 'plastic',
    ageRange: '2-4岁',
    cleanMethod: 'wipe',
    purchaseDate: iso(-90),
    storageLocation: '客厅收纳箱B',
    photo: null,
    createdAt: iso(-90),
    updatedAt: iso(-5),
  },
  {
    id: 'toy-6',
    name: '布制认知拼图',
    material: 'cloth',
    ageRange: '1-2岁',
    cleanMethod: 'water',
    purchaseDate: iso(-150),
    storageLocation: '书房收纳柜',
    photo: null,
    createdAt: iso(-150),
    updatedAt: iso(-14),
  },
  {
    id: 'toy-7',
    name: '金属八音琴敲击玩具',
    material: 'metal',
    ageRange: '1-3岁',
    cleanMethod: 'uv',
    purchaseDate: iso(-200),
    storageLocation: '客厅收纳箱B',
    photo: null,
    createdAt: iso(-200),
    updatedAt: iso(-8),
  },
  {
    id: 'toy-8',
    name: '硅胶辅食咬咬袋',
    material: 'silicone',
    ageRange: '6-12个月',
    cleanMethod: 'water_wipe',
    purchaseDate: iso(-60),
    storageLocation: '客厅收纳箱A',
    photo: null,
    createdAt: iso(-60),
    updatedAt: iso(-1),
  },
];

export const mockCleaningRecords: CleaningRecord[] = [
  { id: generateId(), toyId: 'toy-1', date: iso(-1), methods: ['water', 'dry'], hasDamage: false, hasOdor: false, notes: '沸水消毒5分钟' },
  { id: generateId(), toyId: 'toy-2', date: iso(-7), methods: ['wipe', 'uv'], hasDamage: true, hasOdor: false, damageType: 'peeling', notes: '发现红色积木边角轻微掉漆' },
  { id: generateId(), toyId: 'toy-3', date: iso(-10), methods: ['water', 'dry'], hasDamage: false, hasOdor: true, notes: '洗后仍有轻微奶味，需要多晾几天' },
  { id: generateId(), toyId: 'toy-4', date: iso(-2), methods: ['water', 'wipe'], hasDamage: true, hasOdor: false, damageType: 'mold', notes: '小黄鸭内部发现霉斑' },
  { id: generateId(), toyId: 'toy-5', date: iso(-5), methods: ['wipe'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-6', date: iso(-14), methods: ['water'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-7', date: iso(-8), methods: ['uv', 'wipe'], hasDamage: true, hasOdor: false, damageType: 'loose', notes: '敲击锤连接部分松动' },
  { id: generateId(), toyId: 'toy-8', date: iso(-1), methods: ['water', 'wipe', 'dry'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-1', date: iso(-4), methods: ['wipe'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-2', date: iso(-15), methods: ['wipe'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-3', date: iso(-25), methods: ['water', 'dry'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-4', date: iso(-9), methods: ['water'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-5', date: iso(-12), methods: ['wipe'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-6', date: iso(-28), methods: ['water'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-7', date: iso(-20), methods: ['wipe'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-1', date: iso(-10), methods: ['water', 'dry'], hasDamage: false, hasOdor: false },
  { id: generateId(), toyId: 'toy-8', date: iso(-8), methods: ['water'], hasDamage: false, hasOdor: false },
];

export const mockTasks: DisinfectionTask[] = [
  {
    id: 'task-1',
    title: '每周常规清洁',
    trigger: 'manual',
    toyIds: ['toy-2', 'toy-3', 'toy-5', 'toy-6', 'toy-7'],
    priority: 'normal',
    dueDate: addDaysToISO(1),
    completed: false,
    completedToyIds: [],
    createdAt: iso(0),
  },
  {
    id: 'task-2',
    title: '流感季紧急消毒',
    trigger: 'flu',
    toyIds: ['toy-1', 'toy-3', 'toy-4', 'toy-8'],
    priority: 'critical',
    dueDate: addDaysToISO(0),
    completed: false,
    completedToyIds: ['toy-1'],
    createdAt: iso(0),
  },
];

export const mockAlerts: AlertItem[] = [
  { id: 'alert-1', toyId: 'toy-2', type: 'peeling', recordId: mockCleaningRecords[1].id, status: 'pending', createdAt: iso(-7) },
  { id: 'alert-2', toyId: 'toy-4', type: 'mold', recordId: mockCleaningRecords[3].id, status: 'pending', createdAt: iso(-2) },
  { id: 'alert-3', toyId: 'toy-7', type: 'loose', recordId: mockCleaningRecords[6].id, status: 'pending', createdAt: iso(-8) },
];
