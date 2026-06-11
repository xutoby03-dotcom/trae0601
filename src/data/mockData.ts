import type { WeatherInfo, StaffInfo, KitchenStatus, DishStock, Order, DailyStat, OrderDish } from '@/types';

const now = Date.now();
const min = 60 * 1000;

export const initialWeather: WeatherInfo = {
  rainLevel: 'medium',
  temperature: 22,
  windLevel: 3,
  forecastNextHour: 'heavy',
  recordedAt: now
};

export const initialStaff: StaffInfo = {
  totalChefs: 5,
  availableChefs: 4,
  totalPackers: 3,
  availablePackers: 2,
  totalRiders: 10,
  availableRiders: 3,
  updatedAt: now
};

export const initialKitchen: KitchenStatus = {
  estimatedCookTime: 22,
  currentOrderCount: 38,
  pendingOrderCount: 12,
  avgCookTimeToday: 14,
  updatedAt: now
};

const dishesData: Omit<DishStock, 'id'>[] = [
  { name: '招牌红烧牛肉面', category: '面食', currentStock: 45, safeStock: 30, todaySold: 128, isHot: true },
  { name: '秘制酱肉包(6只)', category: '面点', currentStock: 18, safeStock: 25, todaySold: 89, isHot: true },
  { name: '麻辣香锅套餐', category: '套餐', currentStock: 8, safeStock: 15, todaySold: 67, isHot: true },
  { name: '番茄牛腩饭', category: '饭类', currentStock: 22, safeStock: 20, todaySold: 95, isHot: true },
  { name: '老火例汤', category: '汤品', currentStock: 12, safeStock: 20, todaySold: 76, isHot: true },
  { name: '爽口凉拌黄瓜', category: '凉菜', currentStock: 60, safeStock: 30, todaySold: 42, isHot: false },
  { name: '可乐(大)', category: '饮品', currentStock: 150, safeStock: 50, todaySold: 134, isHot: false },
  { name: '扬州炒饭', category: '饭类', currentStock: 5, safeStock: 20, todaySold: 72, isHot: true },
  { name: '宫保鸡丁', category: '热菜', currentStock: 30, safeStock: 20, todaySold: 56, isHot: true },
  { name: '鱼香肉丝', category: '热菜', currentStock: 3, safeStock: 15, todaySold: 61, isHot: true },
  { name: '酸辣土豆丝', category: '热菜', currentStock: 38, safeStock: 20, todaySold: 48, isHot: true },
  { name: '紫菜蛋花汤', category: '汤品', currentStock: 25, safeStock: 20, todaySold: 55, isHot: true }
];

export const mockDishStocks: DishStock[] = dishesData.map((d, i) => ({
  id: `dish-${i + 1}`,
  ...d
}));

function buildDishes(indices: number[], qty = 1): OrderDish[] {
  return indices.map(i => ({
    dishId: mockDishStocks[i].id,
    dishName: mockDishStocks[i].name,
    quantity: qty,
    unitPrice: [32, 18, 45, 35, 12, 10, 8, 22, 28, 26, 16, 10][i],
    isHot: mockDishStocks[i].isHot
  }));
}

export const mockOrders: Order[] = [
  {
    id: 'o-1', orderNo: 'MT202406110001', platform: 'meituan',
    customerName: '王女士', phone: '138****1234',
    address: '望京SOHO T1-B座1803', distanceKm: 1.2,
    dishes: buildDishes([0, 3, 9]), totalAmount: 98.5,
    isHotFood: true, timeoutRisk: 'critical', status: 'cooking',
    createdAt: now - 25 * min,
    promisedDeliveryAt: now + 5 * min,
    estimatedReadyAt: now + 3 * min,
    remark: '不要辣，面汤分开装'
  },
  {
    id: 'o-2', orderNo: 'EL202406110023', platform: 'eleme',
    customerName: '张先生', phone: '139****5678',
    address: '保利中央公园 8号楼2单元1101', distanceKm: 3.5,
    dishes: buildDishes([2, 7, 11]), totalAmount: 77.0,
    isHotFood: true, timeoutRisk: 'high', status: 'cooking',
    createdAt: now - 18 * min,
    promisedDeliveryAt: now + 18 * min,
    estimatedReadyAt: now + 6 * min
  },
  {
    id: 'o-3', orderNo: 'MT202406110045', platform: 'meituan',
    customerName: '李女士', phone: '136****9012',
    address: '凯德MALL写字楼 2205', distanceKm: 0.8,
    dishes: buildDishes([1, 6]), totalAmount: 34.0,
    isHotFood: true, timeoutRisk: 'medium', status: 'ready',
    createdAt: now - 32 * min,
    promisedDeliveryAt: now + 2 * min,
    estimatedReadyAt: now - 2 * min,
    remark: '包子趁热，谢谢'
  },
  {
    id: 'o-4', orderNo: 'JD202406110078', platform: 'jddj',
    customerName: '陈先生', phone: '137****3456',
    address: '方恒国际中心 C座 509', distanceKm: 2.1,
    dishes: buildDishes([4, 5, 6]), totalAmount: 30.0,
    isHotFood: true, timeoutRisk: 'medium', status: 'pending',
    createdAt: now - 8 * min,
    promisedDeliveryAt: now + 32 * min,
    estimatedReadyAt: now + 15 * min
  },
  {
    id: 'o-5', orderNo: 'EL202406110056', platform: 'eleme',
    customerName: '赵先生', phone: '135****7890',
    address: '大西洋新城 F区 302号楼', distanceKm: 4.8,
    dishes: buildDishes([0, 0, 8], 1), totalAmount: 92.0,
    isHotFood: true, timeoutRisk: 'high', status: 'picked',
    createdAt: now - 40 * min,
    promisedDeliveryAt: now + 10 * min,
    estimatedReadyAt: now - 15 * min
  },
  {
    id: 'o-6', orderNo: 'MT202406110089', platform: 'meituan',
    customerName: '刘女士', phone: '131****2345',
    address: '东湖湾 西区 6号楼', distanceKm: 2.9,
    dishes: buildDishes([7, 9, 10]), totalAmount: 68.0,
    isHotFood: true, timeoutRisk: 'critical', status: 'cooking',
    createdAt: now - 30 * min,
    promisedDeliveryAt: now - 2 * min,
    estimatedReadyAt: now + 2 * min,
    remark: '鱼香肉丝多放蒜'
  },
  {
    id: 'o-7', orderNo: 'EL202406110071', platform: 'eleme',
    customerName: '孙先生', phone: '132****6789',
    address: '望京西园 四区 420楼', distanceKm: 1.5,
    dishes: buildDishes([3, 11]), totalAmount: 45.0,
    isHotFood: true, timeoutRisk: 'low', status: 'completed',
    createdAt: now - 65 * min,
    promisedDeliveryAt: now - 10 * min,
    estimatedReadyAt: now - 40 * min
  },
  {
    id: 'o-8', orderNo: 'MT202406110102', platform: 'meituan',
    customerName: '周女士', phone: '133****0123',
    address: '国风北京 610号楼', distanceKm: 3.2,
    dishes: buildDishes([0, 1, 4, 6]), totalAmount: 70.0,
    isHotFood: true, timeoutRisk: 'high', status: 'ready',
    createdAt: now - 22 * min,
    promisedDeliveryAt: now + 8 * min,
    estimatedReadyAt: now - 1 * min
  },
  {
    id: 'o-9', orderNo: 'JD202406110099', platform: 'jddj',
    customerName: '吴先生', phone: '130****4567',
    address: '华彩国际公寓 7号楼', distanceKm: 5.2,
    dishes: buildDishes([8, 10, 3]), totalAmount: 79.0,
    isHotFood: true, timeoutRisk: 'critical', status: 'cooking',
    createdAt: now - 35 * min,
    promisedDeliveryAt: now - 5 * min,
    estimatedReadyAt: now + 5 * min
  },
  {
    id: 'o-10', orderNo: 'MT202406110115', platform: 'meituan',
    customerName: '郑女士', phone: '188****8901',
    address: '融科橄榄城 12号楼', distanceKm: 2.5,
    dishes: buildDishes([2, 6]), totalAmount: 53.0,
    isHotFood: true, timeoutRisk: 'medium', status: 'pending',
    createdAt: now - 5 * min,
    promisedDeliveryAt: now + 40 * min,
    estimatedReadyAt: now + 18 * min
  },
  {
    id: 'o-11', orderNo: 'EL202406110088', platform: 'eleme',
    customerName: '冯先生', phone: '187****2345',
    address: '宝星园 103号楼', distanceKm: 3.8,
    dishes: buildDishes([5, 6]), totalAmount: 18.0,
    isHotFood: false, timeoutRisk: 'low', status: 'picked',
    createdAt: now - 50 * min,
    promisedDeliveryAt: now + 15 * min,
    estimatedReadyAt: now - 25 * min
  },
  {
    id: 'o-12', orderNo: 'MT202406110123', platform: 'meituan',
    customerName: '许女士', phone: '186****6789',
    address: '慧谷阳光 3号楼', distanceKm: 1.9,
    dishes: buildDishes([1, 4, 7]), totalAmount: 52.0,
    isHotFood: true, timeoutRisk: 'low', status: 'completed',
    createdAt: now - 80 * min,
    promisedDeliveryAt: now - 25 * min,
    estimatedReadyAt: now - 55 * min
  }
];

function buildDailyStat(
  date: string,
  isRainy: boolean,
  rainLevel: DailyStat['rainLevel'],
  orders: number,
  timeout: number,
  cookTime: number,
  cancelled: number,
  outDishes: string[],
  riderWait: number
): DailyStat {
  return {
    date,
    isRainy,
    rainLevel,
    totalOrders: orders,
    timeoutOrders: timeout,
    timeoutRate: +(timeout / orders).toFixed(4),
    avgCookTime: cookTime,
    cancelledOrders: cancelled,
    stockOutDishes: outDishes,
    avgRiderWaitTime: riderWait
  };
}

export const mockDailyStats: DailyStat[] = [
  buildDailyStat('2024-06-05', false, 'sunny', 182, 8, 12, 3, [], 5),
  buildDailyStat('2024-06-06', true, 'light', 245, 22, 16, 7, ['扬州炒饭'], 9),
  buildDailyStat('2024-06-07', true, 'medium', 298, 38, 19, 12, ['鱼香肉丝', '扬州炒饭'], 12),
  buildDailyStat('2024-06-08', true, 'heavy', 342, 56, 24, 21, ['秘制酱肉包', '鱼香肉丝', '扬州炒饭'], 18),
  buildDailyStat('2024-06-09', false, 'sunny', 196, 6, 11, 2, [], 4),
  buildDailyStat('2024-06-10', true, 'storm', 386, 72, 28, 34, ['秘制酱肉包', '鱼香肉丝', '扬州炒饭', '老火例汤'], 24),
  buildDailyStat('2024-06-11', true, 'medium', 156, 18, 18, 6, ['扬州炒饭', '鱼香肉丝'], 11)
];
