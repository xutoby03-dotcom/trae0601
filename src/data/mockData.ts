import type { Pot, CookingRecord, ProductionBatch, Complaint } from '../types';

const now = new Date();
const today = now.toISOString().split('T')[0];

const generateId = () => Math.random().toString(36).substring(2, 9);

const cookingRecords1: CookingRecord[] = [
  {
    id: generateId(),
    potId: 'pot-1',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    operator: '张师傅',
    waterAmount: 2000,
    saltAmount: 30,
    sugarAmount: 50,
    spicePackCount: 1,
    stockAmount: 500,
    tasteResult: 'normal',
    remark: '味道正常，续煮后口感稳定',
  },
  {
    id: generateId(),
    potId: 'pot-1',
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    operator: '李师傅',
    waterAmount: 1500,
    saltAmount: 25,
    sugarAmount: 40,
    spicePackCount: 0,
    stockAmount: 300,
    tasteResult: 'light',
    remark: '味道偏淡，多加了5g盐',
  },
];

const cookingRecords2: CookingRecord[] = [
  {
    id: generateId(),
    potId: 'pot-2',
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    operator: '王师傅',
    waterAmount: 2500,
    saltAmount: 35,
    sugarAmount: 60,
    spicePackCount: 1,
    stockAmount: 800,
    tasteResult: 'normal',
  },
];

const cookingRecords3: CookingRecord[] = [
  {
    id: generateId(),
    potId: 'pot-3',
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    operator: '张师傅',
    waterAmount: 3000,
    saltAmount: 40,
    sugarAmount: 70,
    spicePackCount: 2,
    stockAmount: 1000,
    tasteResult: 'weak',
    remark: '香味不足，加了一包香料',
  },
];

const productionBatches1: ProductionBatch[] = [
  {
    id: generateId(),
    potId: 'pot-1',
    itemName: '鸭脖',
    quantity: 20,
    outTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    operator: '张师傅',
    hasComplaint: false,
  },
  {
    id: generateId(),
    potId: 'pot-1',
    itemName: '鸡爪',
    quantity: 15,
    outTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    operator: '张师傅',
    hasComplaint: true,
  },
];

const productionBatches2: ProductionBatch[] = [
  {
    id: generateId(),
    potId: 'pot-2',
    itemName: '豆干',
    quantity: 30,
    outTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    operator: '李师傅',
    hasComplaint: false,
  },
];

const productionBatches3: ProductionBatch[] = [
  {
    id: generateId(),
    potId: 'pot-3',
    itemName: '鸭脖',
    quantity: 25,
    outTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    operator: '王师傅',
    hasComplaint: false,
  },
];

const complaints1: Complaint[] = [
  {
    id: generateId(),
    batchId: productionBatches1[1].id,
    potId: 'pot-1',
    complaintType: '口味偏咸',
    description: '客人反馈鸡爪太咸，需要调整盐度',
    timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
  },
];

export const mockPots: Pot[] = [
  {
    id: 'pot-1',
    name: '1号卤锅',
    soupLevel: 65,
    salinity: 'high',
    color: 'normal',
    needSkim: true,
    todayItems: ['鸭脖', '鸡爪', '豆干'],
    continuousUseHours: 48,
    status: 'warning',
    lastCleanDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    spicePackCount: 8,
    cookingRecords: cookingRecords1,
    productionBatches: productionBatches1,
    complaints: complaints1,
  },
  {
    id: 'pot-2',
    name: '2号卤锅',
    soupLevel: 80,
    salinity: 'normal',
    color: 'normal',
    needSkim: false,
    todayItems: ['豆干', '莲藕'],
    continuousUseHours: 24,
    status: 'normal',
    lastCleanDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    spicePackCount: 3,
    cookingRecords: cookingRecords2,
    productionBatches: productionBatches2,
    complaints: [],
  },
  {
    id: 'pot-3',
    name: '3号卤锅',
    soupLevel: 25,
    salinity: 'low',
    color: 'light',
    needSkim: false,
    todayItems: ['鸭脖', '鸭翅'],
    continuousUseHours: 78,
    status: 'danger',
    lastCleanDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    spicePackCount: 12,
    cookingRecords: cookingRecords3,
    productionBatches: productionBatches3,
    complaints: [],
  },
  {
    id: 'pot-4',
    name: '4号卤锅',
    soupLevel: 55,
    salinity: 'normal',
    color: 'dark',
    needSkim: true,
    todayItems: ['牛肉', '牛肚'],
    continuousUseHours: 36,
    status: 'normal',
    lastCleanDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    spicePackCount: 6,
    cookingRecords: [],
    productionBatches: [],
    complaints: [],
  },
];

export const getTodayString = () => today;
