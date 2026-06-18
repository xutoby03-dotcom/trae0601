import type { CoffeeFlavor, InventoryBatch, ConsumptionLog, SupplyItem, SupplyLog, Department, PurchaseItem } from '../types';
import { addDays, generateId } from '../utils/date';

const now = new Date();

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: '研发部' },
  { id: 'dept-2', name: '产品部' },
  { id: 'dept-3', name: '设计部' },
  { id: 'dept-4', name: '市场部' },
  { id: 'dept-5', name: '运营部' },
  { id: 'dept-6', name: '行政人事部' },
  { id: 'dept-7', name: '财务部' },
];

const flavorPhoto = (seed: string) => 
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`Nespresso coffee capsule box, ${seed} flavor, premium packaging, product photography, white background`)}&image_size=square_hd`;

export const mockFlavors: CoffeeFlavor[] = [
  {
    id: 'flavor-1',
    name: '阿佩奇欧',
    brand: 'Nespresso',
    intensity: 9,
    roastLevel: 'dark',
    compatibleMachines: ['Nespresso Original'],
    unitPrice: 6.5,
    boxPhoto: flavorPhoto('Arpeggio intense dark roast'),
    safetyStock: 20,
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-2',
    name: '利梵托',
    brand: 'Nespresso',
    intensity: 6,
    roastLevel: 'medium',
    compatibleMachines: ['Nespresso Original'],
    unitPrice: 6.5,
    boxPhoto: flavorPhoto('Livanto medium roast caramel'),
    safetyStock: 20,
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-3',
    name: '沃鲁托',
    brand: 'Nespresso',
    intensity: 4,
    roastLevel: 'light',
    compatibleMachines: ['Nespresso Original'],
    unitPrice: 6.5,
    boxPhoto: flavorPhoto('Volluto light roast fruity'),
    safetyStock: 15,
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-4',
    name: '罗榭托',
    brand: 'Nespresso',
    intensity: 10,
    roastLevel: 'dark',
    compatibleMachines: ['Nespresso Original'],
    unitPrice: 7.0,
    boxPhoto: flavorPhoto('Ristretto intense bold dark'),
    safetyStock: 20,
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-5',
    name: '卡普姬',
    brand: 'Nespresso',
    intensity: 6,
    roastLevel: 'medium',
    compatibleMachines: ['Nespresso Original'],
    unitPrice: 7.5,
    boxPhoto: flavorPhoto('Capriccio medium roast cereal'),
    safetyStock: 15,
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-6',
    name: '梵蒂冈',
    brand: 'Nespresso',
    intensity: 7,
    roastLevel: 'medium',
    compatibleMachines: ['Nespresso Vertuo'],
    unitPrice: 8.0,
    boxPhoto: flavorPhoto('Venezia medium roast spicy'),
    safetyStock: 10,
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-7',
    name: '意式浓缩',
    brand: 'Lavazza',
    intensity: 8,
    roastLevel: 'dark',
    compatibleMachines: ['Nespresso Original', 'Lavazza A Modo Mio'],
    unitPrice: 5.5,
    boxPhoto: flavorPhoto('Lavazza espresso dark roast'),
    safetyStock: 20,
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flavor-8',
    name: '美式醇香',
    brand: '星巴克',
    intensity: 5,
    roastLevel: 'medium',
    compatibleMachines: ['Nespresso Original'],
    unitPrice: 7.0,
    boxPhoto: flavorPhoto('Starbucks house blend medium'),
    safetyStock: 15,
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockInventoryBatches: InventoryBatch[] = [
  { id: 'batch-1', flavorId: 'flavor-1', quantity: 35, expiryDate: addDays(now, 180).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-2', flavorId: 'flavor-1', quantity: 10, expiryDate: addDays(now, 15).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-3', flavorId: 'flavor-2', quantity: 28, expiryDate: addDays(now, 200).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-4', flavorId: 'flavor-3', quantity: 8, expiryDate: addDays(now, 90).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-5', flavorId: 'flavor-4', quantity: 42, expiryDate: addDays(now, 150).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-6', flavorId: 'flavor-5', quantity: 3, expiryDate: addDays(now, 60).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-7', flavorId: 'flavor-6', quantity: 15, expiryDate: addDays(now, 120).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-8', flavorId: 'flavor-7', quantity: 5, expiryDate: addDays(now, 5).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-9', flavorId: 'flavor-7', quantity: 25, expiryDate: addDays(now, 160).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-10', flavorId: 'flavor-8', quantity: 12, expiryDate: addDays(now, -10).toISOString().split('T')[0], status: 'expired', createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-11', flavorId: 'flavor-8', quantity: 18, expiryDate: addDays(now, 100).toISOString().split('T')[0], status: 'damp', createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'batch-12', flavorId: 'flavor-8', quantity: 20, expiryDate: addDays(now, 130).toISOString().split('T')[0], status: 'normal', createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const generateConsumptionLogs = (): ConsumptionLog[] => {
  const logs: ConsumptionLog[] = [];
  const flavors = ['flavor-1', 'flavor-2', 'flavor-3', 'flavor-4', 'flavor-5', 'flavor-6', 'flavor-7', 'flavor-8'];
  const departments = ['研发部', '产品部', '设计部', '市场部', '运营部', '行政人事部', '财务部'];
  const weights = [0.25, 0.2, 0.1, 0.15, 0.08, 0.12, 0.05, 0.05];
  const deptWeights = [0.3, 0.15, 0.15, 0.1, 0.1, 0.1, 0.1];

  for (let day = 60; day >= 0; day--) {
    const date = addDays(now, -day);
    const logsPerDay = Math.floor(Math.random() * 15) + 10;
    
    for (let i = 0; i < logsPerDay; i++) {
      let rand = Math.random();
      let flavorIdx = 0;
      for (let j = 0; j < weights.length; j++) {
        rand -= weights[j];
        if (rand <= 0) { flavorIdx = j; break; }
      }

      rand = Math.random();
      let deptIdx = 0;
      for (let j = 0; j < deptWeights.length; j++) {
        rand -= deptWeights[j];
        if (rand <= 0) { deptIdx = j; break; }
      }

      logs.push({
        id: generateId(),
        flavorId: flavors[flavorIdx],
        quantity: Math.floor(Math.random() * 3) + 1,
        department: departments[deptIdx],
        consumedAt: new Date(date.getTime() + Math.random() * 10 * 60 * 60 * 1000).toISOString(),
      });
    }
  }
  return logs;
};

export const mockConsumptionLogs: ConsumptionLog[] = generateConsumptionLogs();

export const mockSupplies: SupplyItem[] = [
  {
    id: 'supply-1',
    name: '咖啡机清洁片',
    category: 'cleaning',
    quantity: 8,
    unitPrice: 15.0,
    safetyStock: 10,
    expiryDate: addDays(now, 365).toISOString().split('T')[0],
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'supply-2',
    name: '除垢剂',
    category: 'descaler',
    quantity: 3,
    unitPrice: 45.0,
    safetyStock: 5,
    expiryDate: addDays(now, 545).toISOString().split('T')[0],
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'supply-3',
    name: '一次性纸杯 (8oz)',
    category: 'cups',
    quantity: 200,
    unitPrice: 0.5,
    safetyStock: 300,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'supply-4',
    name: '一次性纸杯 (12oz)',
    category: 'cups',
    quantity: 150,
    unitPrice: 0.6,
    safetyStock: 200,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'supply-5',
    name: '木质搅拌棒',
    category: 'other',
    quantity: 500,
    unitPrice: 0.1,
    safetyStock: 500,
    createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'supply-6',
    name: '杯盖',
    category: 'cups',
    quantity: 180,
    unitPrice: 0.3,
    safetyStock: 300,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockSupplyLogs: SupplyLog[] = [
  { id: 'slog-1', supplyId: 'supply-1', quantity: 2, type: 'consume', department: '行政人事部', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'slog-2', supplyId: 'supply-1', quantity: 10, type: 'restock', createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'slog-3', supplyId: 'supply-2', quantity: 1, type: 'consume', department: '行政人事部', createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'slog-4', supplyId: 'supply-3', quantity: 100, type: 'restock', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'slog-5', supplyId: 'supply-4', quantity: 100, type: 'restock', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'slog-6', supplyId: 'supply-6', quantity: 200, type: 'restock', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'slog-7', supplyId: 'supply-1', quantity: 1, type: 'consume', department: '行政人事部', createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() },
];

export const mockPurchaseItems: PurchaseItem[] = [
  {
    id: 'purchase-1',
    itemType: 'coffee',
    type: 'coffee',
    itemId: 'flavor-3',
    itemName: 'Arpeggio 浓烈',
    suggestedQuantity: 30,
    actualQuantity: 30,
    quantity: 30,
    unitPrice: 5.5,
    status: 'pending',
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'purchase-2',
    itemType: 'coffee',
    type: 'coffee',
    itemId: 'flavor-5',
    itemName: 'Livanto 平衡',
    suggestedQuantity: 40,
    actualQuantity: 40,
    quantity: 40,
    unitPrice: 5.0,
    status: 'pending',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'purchase-3',
    itemType: 'supply',
    type: 'supply',
    itemId: 'supply-2',
    itemName: '除垢剂',
    suggestedQuantity: 8,
    actualQuantity: 8,
    quantity: 8,
    unitPrice: 45.0,
    status: 'ordered',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    purchasedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'purchase-4',
    itemType: 'supply',
    type: 'supply',
    itemId: 'supply-3',
    itemName: '一次性纸杯 (8oz)',
    suggestedQuantity: 500,
    actualQuantity: 500,
    quantity: 500,
    unitPrice: 0.5,
    status: 'pending',
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
