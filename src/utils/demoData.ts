import type { Material, Project, ProjectMaterial, UsageRecord } from '@/types'

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

export const DEMO_MATERIALS: Material[] = [
  {
    id: 'm1', name: '透明滴胶', category: '滴胶', colorHex: '#F0F0F0', colorName: '透明',
    specification: '500ml', quantity: 3, unit: '瓶', purchaseUrl: '', price: 35,
    storageType: '盒子', storageBox: '滴胶专用盒', storageCompartment: '', storageBag: '',
    lowStockThreshold: 2, createdAt: daysAgo(60), updatedAt: daysAgo(2),
  },
  {
    id: 'm2', name: '天蓝色珠子', category: '串珠', colorHex: '#5DADE2', colorName: '浅蓝色',
    specification: '4mm', quantity: 200, unit: '颗', purchaseUrl: '', price: 0.05,
    storageType: '格子', storageBox: '', storageCompartment: '3层2格', storageBag: '',
    lowStockThreshold: 50, createdAt: daysAgo(45), updatedAt: daysAgo(5),
  },
  {
    id: 'm3', name: '薄荷绿珠子', category: '串珠', colorHex: '#6BBF8A', colorName: '薄荷',
    specification: '6mm', quantity: 30, unit: '颗', purchaseUrl: '', price: 0.08,
    storageType: '格子', storageBox: '', storageCompartment: '3层3格', storageBag: '',
    lowStockThreshold: 50, createdAt: daysAgo(45), updatedAt: daysAgo(10),
  },
  {
    id: 'm4', name: '棉麻布-米色', category: '布艺', colorHex: '#D4B896', colorName: '米色',
    specification: 'A4大小', quantity: 8, unit: '片', purchaseUrl: '', price: 5.5,
    storageType: '袋子', storageBox: '', storageCompartment: '', storageBag: '布料袋',
    lowStockThreshold: 3, createdAt: daysAgo(30), updatedAt: daysAgo(7),
  },
  {
    id: 'm5', name: '消泡剂', category: '滴胶', colorHex: '#FFFFFF', colorName: '白色',
    specification: '100ml', quantity: 1, unit: '瓶', purchaseUrl: '', price: 18,
    storageType: '盒子', storageBox: '滴胶专用盒', storageCompartment: '', storageBag: '',
    lowStockThreshold: 2, createdAt: daysAgo(50), updatedAt: daysAgo(3),
  },
  {
    id: 'm6', name: '樱花粉珠子', category: '串珠', colorHex: '#F5D0E8', colorName: '浅粉色',
    specification: '4mm', quantity: 150, unit: '颗', purchaseUrl: '', price: 0.06,
    storageType: '格子', storageBox: '', storageCompartment: '3层1格', storageBag: '',
    lowStockThreshold: 50, createdAt: daysAgo(40), updatedAt: daysAgo(12),
  },
  {
    id: 'm7', name: '模型刻刀', category: '模型', colorHex: '#95A5A6', colorName: '灰色',
    specification: '标准款', quantity: 2, unit: '把', purchaseUrl: '', price: 25,
    storageType: '盒子', storageBox: '工具盒', storageCompartment: '', storageBag: '',
    lowStockThreshold: 1, createdAt: daysAgo(90), updatedAt: daysAgo(90),
  },
  {
    id: 'm8', name: '蕾丝花边-白色', category: '布艺', colorHex: '#FFFFFF', colorName: '白色',
    specification: '2cm宽', quantity: 2, unit: '米', purchaseUrl: '', price: 8,
    storageType: '袋子', storageBox: '', storageCompartment: '', storageBag: '蕾丝袋',
    lowStockThreshold: 3, createdAt: daysAgo(20), updatedAt: daysAgo(15),
  },
  {
    id: 'm9', name: '蓝绿色米珠', category: '串珠', colorHex: '#1ABC9C', colorName: '青色',
    specification: '2mm', quantity: 500, unit: '颗', purchaseUrl: '', price: 0.02,
    storageType: '格子', storageBox: '', storageCompartment: '2层5格', storageBag: '',
    lowStockThreshold: 100, createdAt: daysAgo(35), updatedAt: daysAgo(8),
  },
  {
    id: 'm10', name: 'AB胶-B胶', category: '滴胶', colorHex: '#FFF8F0', colorName: '米色',
    specification: '500ml', quantity: 2, unit: '瓶', purchaseUrl: '', price: 28,
    storageType: '盒子', storageBox: '滴胶专用盒', storageCompartment: '', storageBag: '',
    lowStockThreshold: 2, createdAt: daysAgo(60), updatedAt: daysAgo(1),
  },
  {
    id: 'm11', name: '深蓝丝绒布', category: '布艺', colorHex: '#2980B9', colorName: '深蓝色',
    specification: '20×20cm', quantity: 5, unit: '片', purchaseUrl: '', price: 12,
    storageType: '袋子', storageBox: '', storageCompartment: '', storageBag: '布料袋',
    lowStockThreshold: 2, createdAt: daysAgo(25), updatedAt: daysAgo(25),
  },
  {
    id: 'm12', name: '砂纸套装', category: '模型', colorHex: '#D4B896', colorName: '米色',
    specification: '400-2000目', quantity: 1, unit: '套', purchaseUrl: '', price: 15,
    storageType: '盒子', storageBox: '工具盒', storageCompartment: '', storageBag: '',
    lowStockThreshold: 1, createdAt: daysAgo(70), updatedAt: daysAgo(70),
  },
]

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'p1', name: '海洋风滴胶手机壳', description: '用蓝色系滴胶制作海洋主题手机壳，需要搭配贝壳和珠子装饰',
    status: '进行中', createdAt: daysAgo(15), updatedAt: daysAgo(2),
  },
  {
    id: 'p2', name: '串珠手链-春日花园', description: '粉色和绿色系的串珠手链，樱花主题',
    status: '进行中', createdAt: daysAgo(10), updatedAt: daysAgo(5),
  },
]

export const DEMO_PROJECT_MATERIALS: ProjectMaterial[] = [
  { id: 'pm1', projectId: 'p1', materialId: 'm1', requiredQuantity: 2, usedQuantity: 1 },
  { id: 'pm2', projectId: 'p1', materialId: 'm5', requiredQuantity: 1, usedQuantity: 0 },
  { id: 'pm3', projectId: 'p1', materialId: 'm9', requiredQuantity: 100, usedQuantity: 50 },
  { id: 'pm4', projectId: 'p2', materialId: 'm6', requiredQuantity: 80, usedQuantity: 40 },
  { id: 'pm5', projectId: 'p2', materialId: 'm3', requiredQuantity: 40, usedQuantity: 10 },
]

export const DEMO_USAGE_RECORDS: UsageRecord[] = [
  { id: 'ur1', materialId: 'm1', projectId: 'p1', quantity: 1, date: daysAgo(5), note: '项目扣料' },
  { id: 'ur2', materialId: 'm9', projectId: 'p1', quantity: 50, date: daysAgo(3), note: '项目扣料' },
  { id: 'ur3', materialId: 'm6', projectId: 'p2', quantity: 40, date: daysAgo(7), note: '项目扣料' },
  { id: 'ur4', materialId: 'm3', projectId: 'p2', quantity: 10, date: daysAgo(4), note: '项目扣料' },
]
