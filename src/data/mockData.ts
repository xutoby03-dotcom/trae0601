import {
  Pitcher,
  FilterReplacement,
  WaterRefill,
  WaterQualityAlert,
  FilterStock,
} from '../types';

const today = new Date();

function daysAgo(days: number): string {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export const mockPitchers: Pitcher[] = [
  {
    id: 'p1',
    name: '厨房水壶',
    brand: '碧然德',
    capacity: 3.5,
    filterModel: 'Marella XL',
    userCount: 3,
    location: '厨房',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20water%20filter%20pitcher%20on%20kitchen%20counter%2C%20clean%20white%20background%2C%20product%20photography&image_size=square',
    createdAt: daysAgo(90),
  },
  {
    id: 'p2',
    name: '客厅水壶',
    brand: '九阳',
    capacity: 2.8,
    filterModel: 'JYW-B05',
    userCount: 2,
    location: '客厅',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20water%20pitcher%20for%20living%20room%2C%20glass%20body%2C%20minimalist%20design&image_size=square',
    createdAt: daysAgo(60),
  },
  {
    id: 'p3',
    name: '书房水壶',
    brand: '小米',
    capacity: 2.0,
    filterModel: '米家滤水壶',
    userCount: 1,
    location: '书房',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=compact%20water%20filter%20pitcher%20for%20study%20room%2C%20modern%20design%2C%20dark%20background&image_size=square',
    createdAt: daysAgo(30),
  },
];

export const mockFilterReplacements: FilterReplacement[] = [
  {
    id: 'f1',
    pitcherId: 'p1',
    installDate: daysAgo(45),
    batchNo: 'BR202403001',
    expectedLifeDays: 60,
    flushCount: 3,
    stockAfter: 4,
    createdAt: daysAgo(45),
  },
  {
    id: 'f2',
    pitcherId: 'p1',
    installDate: daysAgo(105),
    batchNo: 'BR202402015',
    expectedLifeDays: 60,
    flushCount: 3,
    stockAfter: 5,
    createdAt: daysAgo(105),
  },
  {
    id: 'f3',
    pitcherId: 'p2',
    installDate: daysAgo(25),
    batchNo: 'JY202404008',
    expectedLifeDays: 45,
    flushCount: 2,
    stockAfter: 2,
    createdAt: daysAgo(25),
  },
  {
    id: 'f4',
    pitcherId: 'p3',
    installDate: daysAgo(5),
    batchNo: 'MI202405003',
    expectedLifeDays: 30,
    flushCount: 2,
    stockAfter: 0,
    createdAt: daysAgo(5),
  },
];

export const mockWaterRefills: WaterRefill[] = [
  { id: 'r1', pitcherId: 'p1', date: daysAgo(0), count: 3 },
  { id: 'r2', pitcherId: 'p1', date: daysAgo(1), count: 2 },
  { id: 'r3', pitcherId: 'p1', date: daysAgo(2), count: 4 },
  { id: 'r4', pitcherId: 'p1', date: daysAgo(3), count: 3 },
  { id: 'r5', pitcherId: 'p1', date: daysAgo(4), count: 2 },
  { id: 'r6', pitcherId: 'p1', date: daysAgo(5), count: 3 },
  { id: 'r7', pitcherId: 'p1', date: daysAgo(6), count: 2 },
  { id: 'r8', pitcherId: 'p2', date: daysAgo(0), count: 1 },
  { id: 'r9', pitcherId: 'p2', date: daysAgo(1), count: 2 },
  { id: 'r10', pitcherId: 'p2', date: daysAgo(2), count: 1 },
  { id: 'r11', pitcherId: 'p2', date: daysAgo(3), count: 2 },
  { id: 'r12', pitcherId: 'p2', date: daysAgo(5), count: 1 },
  { id: 'r13', pitcherId: 'p3', date: daysAgo(0), count: 1 },
  { id: 'r14', pitcherId: 'p3', date: daysAgo(1), count: 1 },
  { id: 'r15', pitcherId: 'p3', date: daysAgo(2), count: 2 },
  { id: 'r16', pitcherId: 'p3', date: daysAgo(4), count: 1 },
];

export const mockAlerts: WaterQualityAlert[] = [
  {
    id: 'a1',
    pitcherId: 'p1',
    type: 'slow_flow',
    description: '最近几天水流明显变慢，可能需要更换滤芯',
    date: daysAgo(2),
    severity: 'medium',
    resolved: false,
  },
  {
    id: 'a2',
    pitcherId: 'p2',
    type: 'odor',
    description: '水中有轻微氯味',
    date: daysAgo(5),
    severity: 'low',
    resolved: true,
  },
  {
    id: 'a3',
    pitcherId: 'p3',
    type: 'chlorine_test',
    description: '余氯测试显示超标',
    date: daysAgo(1),
    severity: 'high',
    resolved: false,
  },
];

export const mockStocks: FilterStock[] = [
  {
    id: 's1',
    filterModel: 'Marella XL',
    quantity: 2,
    lastUpdated: daysAgo(10),
  },
  {
    id: 's2',
    filterModel: 'JYW-B05',
    quantity: 1,
    lastUpdated: daysAgo(20),
  },
  {
    id: 's3',
    filterModel: '米家滤水壶',
    quantity: 0,
    lastUpdated: daysAgo(5),
  },
];
