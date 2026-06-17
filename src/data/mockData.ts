import { MotherStarter, FeedingRecord, ProductionOrder, AnomalyRecord, StarterStatus, StorageType, AnomalyType } from '@/types';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

export const mockStarters: MotherStarter[] = [
  {
    id: 'starter-001',
    name: '老面种A罐',
    flourType: 'T65高筋粉',
    waterRatio: 1.0,
    container: '玻璃密封罐',
    storageType: StorageType.ROOM_TEMP,
    createdAt: daysAgo(30),
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sourdough%20starter%20in%20glass%20jar%20well%20risen%20bubbly%20healthy%20golden%20brown&image_size=square',
    currentWeight: 400,
    status: StarterStatus.HEALTHY,
    feedingInterval: 12,
    lastFedAt: hoursAgo(10),
    notes: '主力酸种，活力稳定'
  },
  {
    id: 'starter-002',
    name: '黑麦酸种B罐',
    flourType: '黑麦粉',
    waterRatio: 1.2,
    container: '陶瓷罐',
    storageType: StorageType.ROOM_TEMP,
    createdAt: daysAgo(45),
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rye%20sourdough%20starter%20dark%20brown%20in%20ceramic%20pot%20rustic%20bakery&image_size=square',
    currentWeight: 350,
    status: StarterStatus.HEALTHY,
    feedingInterval: 12,
    lastFedAt: hoursAgo(14),
    notes: '风味浓郁，用于黑麦面包'
  },
  {
    id: 'starter-003',
    name: '全麦酸种C罐',
    flourType: '全麦粉',
    waterRatio: 1.1,
    container: '玻璃密封罐',
    storageType: StorageType.REFRIGERATED,
    createdAt: daysAgo(20),
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=whole%20wheat%20sourdough%20starter%20in%20fridge%20container%20light%20brown%20healthy&image_size=square',
    currentWeight: 500,
    status: StarterStatus.COLD,
    feedingInterval: 7,
    lastFedAt: daysAgo(3),
    notes: '冷藏备用，每周喂养一次'
  },
  {
    id: 'starter-004',
    name: '实验酸种D罐',
    flourType: '斯佩尔特粉',
    waterRatio: 1.0,
    container: '塑料容器',
    storageType: StorageType.ROOM_TEMP,
    createdAt: daysAgo(7),
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spelt%20sourdough%20starter%20experimental%20in%20plastic%20container%20light%20creamy&image_size=square',
    currentWeight: 300,
    status: StarterStatus.LOCKED,
    feedingInterval: 12,
    lastFedAt: hoursAgo(18),
    notes: '新配方测试中，出现异味需观察'
  },
  {
    id: 'starter-005',
    name: '传统酸种E罐',
    flourType: 'T55中筋粉',
    waterRatio: 0.9,
    container: '玻璃密封罐',
    storageType: StorageType.ROOM_TEMP,
    createdAt: daysAgo(60),
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20sourdough%20starter%20established%20mature%20in%20glass%20jar%20bakery%20kitchen&image_size=square',
    currentWeight: 450,
    status: StarterStatus.HEALTHY,
    feedingInterval: 12,
    lastFedAt: hoursAgo(8),
    notes: '传家宝级酸种，历史悠久'
  }
];

export const mockFeedingRecords: FeedingRecord[] = [
  {
    id: 'feed-001',
    starterId: 'starter-001',
    fedAt: hoursAgo(10),
    discardAmount: 150,
    flourAdded: 150,
    waterAdded: 150,
    temperature: 25,
    odor: 'fruity',
    riseMultiplier: 2.8,
    peakTime: 5,
    anomalies: [],
    activityScore: 92,
    notes: '状态极佳，气泡丰富'
  },
  {
    id: 'feed-002',
    starterId: 'starter-001',
    fedAt: hoursAgo(22),
    discardAmount: 180,
    flourAdded: 150,
    waterAdded: 150,
    temperature: 24,
    odor: 'bready',
    riseMultiplier: 2.5,
    peakTime: 5.5,
    anomalies: [],
    activityScore: 85
  },
  {
    id: 'feed-003',
    starterId: 'starter-001',
    fedAt: hoursAgo(34),
    discardAmount: 160,
    flourAdded: 150,
    waterAdded: 150,
    temperature: 26,
    odor: 'vinegar',
    riseMultiplier: 2.2,
    peakTime: 4.5,
    anomalies: [],
    activityScore: 78
  },
  {
    id: 'feed-004',
    starterId: 'starter-002',
    fedAt: hoursAgo(14),
    discardAmount: 120,
    flourAdded: 120,
    waterAdded: 144,
    temperature: 23,
    odor: 'bready',
    riseMultiplier: 2.3,
    peakTime: 6,
    anomalies: [],
    activityScore: 76
  },
  {
    id: 'feed-005',
    starterId: 'starter-002',
    fedAt: hoursAgo(26),
    discardAmount: 130,
    flourAdded: 120,
    waterAdded: 144,
    temperature: 25,
    odor: 'fruity',
    riseMultiplier: 2.6,
    peakTime: 5,
    anomalies: [],
    activityScore: 86
  },
  {
    id: 'feed-006',
    starterId: 'starter-004',
    fedAt: hoursAgo(18),
    discardAmount: 100,
    flourAdded: 100,
    waterAdded: 100,
    temperature: 27,
    odor: 'putrid',
    riseMultiplier: 1.2,
    peakTime: 8,
    anomalies: [AnomalyType.ODOR, AnomalyType.COLLAPSE],
    activityScore: 22,
    notes: '出现腐臭异味，顶部塌陷，疑似污染'
  },
  {
    id: 'feed-007',
    starterId: 'starter-003',
    fedAt: daysAgo(3),
    discardAmount: 200,
    flourAdded: 200,
    waterAdded: 220,
    temperature: 4,
    odor: 'cheesy',
    riseMultiplier: 1.5,
    peakTime: 24,
    anomalies: [],
    activityScore: 58,
    notes: '冷藏中，正常休眠状态'
  },
  {
    id: 'feed-008',
    starterId: 'starter-005',
    fedAt: hoursAgo(8),
    discardAmount: 180,
    flourAdded: 180,
    waterAdded: 162,
    temperature: 25,
    odor: 'fruity',
    riseMultiplier: 3.0,
    peakTime: 4.5,
    anomalies: [],
    activityScore: 95,
    notes: '完美状态，膨胀三倍'
  },
  {
    id: 'feed-009',
    starterId: 'starter-005',
    fedAt: hoursAgo(20),
    discardAmount: 170,
    flourAdded: 180,
    waterAdded: 162,
    temperature: 24,
    odor: 'bready',
    riseMultiplier: 2.7,
    peakTime: 5,
    anomalies: [],
    activityScore: 88
  },
  {
    id: 'feed-010',
    starterId: 'starter-001',
    fedAt: hoursAgo(46),
    discardAmount: 150,
    flourAdded: 150,
    waterAdded: 150,
    temperature: 25,
    odor: 'fruity',
    riseMultiplier: 2.6,
    peakTime: 5,
    anomalies: [],
    activityScore: 86
  },
  {
    id: 'feed-011',
    starterId: 'starter-001',
    fedAt: hoursAgo(58),
    discardAmount: 140,
    flourAdded: 150,
    waterAdded: 150,
    temperature: 26,
    odor: 'vinegar',
    riseMultiplier: 2.4,
    peakTime: 4,
    anomalies: [],
    activityScore: 80
  },
  {
    id: 'feed-012',
    starterId: 'starter-001',
    fedAt: hoursAgo(70),
    discardAmount: 160,
    flourAdded: 150,
    waterAdded: 150,
    temperature: 24,
    odor: 'fruity',
    riseMultiplier: 2.9,
    peakTime: 5.5,
    anomalies: [],
    activityScore: 90
  }
];

export const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'order-001',
    orderNo: 'PO-2026-0617-001',
    productName: '乡村硬欧包',
    plannedDate: new Date().toISOString().split('T')[0],
    plannedQuantity: 30,
    starterId: 'starter-001',
    starterAmount: 120,
    status: 'pending',
    notes: '主打产品，需保证品质'
  },
  {
    id: 'order-002',
    orderNo: 'PO-2026-0617-002',
    productName: '黑麦裸麦酸面包',
    plannedDate: new Date().toISOString().split('T')[0],
    plannedQuantity: 20,
    starterId: 'starter-002',
    starterAmount: 100,
    status: 'pending',
    notes: '使用黑麦酸种'
  },
  {
    id: 'order-003',
    orderNo: 'PO-2026-0617-003',
    productName: '全麦核桃酸包',
    plannedDate: new Date().toISOString().split('T')[0],
    plannedQuantity: 15,
    status: 'pending',
    notes: '待定酸种'
  },
  {
    id: 'order-004',
    orderNo: 'PO-2026-0618-001',
    productName: '传统法棍',
    plannedDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    plannedQuantity: 50,
    starterId: 'starter-005',
    starterAmount: 150,
    status: 'pending'
  },
  {
    id: 'order-005',
    orderNo: 'PO-2026-0616-001',
    productName: '实验酸种面包',
    plannedDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    plannedQuantity: 10,
    starterId: 'starter-004',
    starterAmount: 60,
    status: 'cancelled',
    notes: '酸种异常，订单取消'
  }
];

export const mockAnomalyRecords: AnomalyRecord[] = [
  {
    id: 'anomaly-001',
    starterId: 'starter-004',
    type: AnomalyType.ODOR,
    detectedAt: hoursAgo(16),
    reportedBy: '张师傅',
    description: '喂养后8小时出现腐臭异味，怀疑杂菌污染',
    status: 'open',
    affectedOrderIds: ['order-005']
  },
  {
    id: 'anomaly-002',
    starterId: 'starter-004',
    type: AnomalyType.COLLAPSE,
    detectedAt: hoursAgo(16),
    reportedBy: '张师傅',
    description: '酸种顶部塌陷，未达到正常膨胀高度',
    status: 'open',
    affectedOrderIds: ['order-005']
  }
];
