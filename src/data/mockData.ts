import { Device, ReplacementRecord, Inventory } from '../types';
import { calculateExpectedExpireDate } from '../utils/dateUtils';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const mockDevices: Device[] = [
  {
    id: 'device-1',
    brand: '小米',
    location: '厨房主净水器',
    filterModel: 'MR424-Z',
    suggestCycleDays: 180,
    purchaseChannel: '京东小米官方旗舰店',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20kitchen%20water%20purifier%20appliance%20white%20minimalist&image_size=square',
    notes: '厨下式反渗透净水器',
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'device-2',
    brand: '3M',
    location: '客厅饮水机',
    filterModel: 'DWS2500-CN',
    suggestCycleDays: 365,
    purchaseChannel: '天猫3M官方旗舰店',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=desktop%20water%20dispenser%20with%20filter%20silver%20modern&image_size=square',
    notes: '台上式直饮机',
    createdAt: '2025-02-20T00:00:00.000Z',
  },
  {
    id: 'device-3',
    brand: '史密斯',
    location: '主卧卫生间',
    filterModel: 'R1800RC9',
    suggestCycleDays: 730,
    purchaseChannel: '苏宁易购线下店',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bathroom%20water%20filter%20system%20chrome%20finish&image_size=square',
    notes: '沐浴软水机',
    createdAt: '2025-03-10T00:00:00.000Z',
  },
  {
    id: 'device-4',
    brand: '沁园',
    location: '老人房',
    filterModel: 'KRL3833',
    suggestCycleDays: 90,
    purchaseChannel: '沁园官网',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20countertop%20water%20purifier%20white%20blue%20light&image_size=square',
    notes: '加热一体净水器',
    createdAt: '2025-04-05T00:00:00.000Z',
  },
];

const createMockRecord = (
  id: string,
  deviceId: string,
  daysAgo: number,
  cycleDays: number,
  batchNumber: string,
  cost: number,
  remainingInventory: number
): ReplacementRecord => {
  const installDate = new Date(today);
  installDate.setDate(installDate.getDate() - daysAgo);
  const installDateStr = formatDate(installDate);
  return {
    id,
    deviceId,
    batchNumber,
    installDate: installDateStr,
    expectedExpireDate: calculateExpectedExpireDate(installDateStr, cycleDays),
    installer: '张先生',
    cost,
    remainingInventory,
    notes: '',
    createdAt: installDate.toISOString(),
  };
};

export const mockRecords: ReplacementRecord[] = [
  createMockRecord('record-1', 'device-1', 10, 180, 'B202512001', 199, 3),
  createMockRecord('record-2', 'device-1', 190, 180, 'B202506003', 199, 4),
  createMockRecord('record-3', 'device-2', 20, 365, '3M20250501', 399, 1),
  createMockRecord('record-4', 'device-3', 400, 730, 'SM202404015', 899, 0),
  createMockRecord('record-5', 'device-4', 80, 90, 'QY202601008', 129, 2),
  createMockRecord('record-6', 'device-4', 175, 90, 'QY202509022', 129, 3),
];

export const mockInventory: Inventory[] = [
  {
    id: 'inv-1',
    filterModel: 'MR424-Z',
    quantity: 3,
    unitPrice: 199,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    filterModel: 'DWS2500-CN',
    quantity: 1,
    unitPrice: 399,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    filterModel: 'R1800RC9',
    quantity: 0,
    unitPrice: 899,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-4',
    filterModel: 'KRL3833',
    quantity: 2,
    unitPrice: 129,
    lastUpdated: new Date().toISOString(),
  },
];

export const initializeMockData = () => {
  const storageKey = 'filter-management-storage';
  const existing = localStorage.getItem(storageKey);
  
  if (!existing) {
    const mockState = {
      state: {
        devices: mockDevices,
        records: mockRecords,
        inventory: mockInventory,
      },
      version: 0,
    };
    localStorage.setItem(storageKey, JSON.stringify(mockState));
  }
};
