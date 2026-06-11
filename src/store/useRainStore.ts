import { create } from 'zustand';
import type {
  WeatherInfo,
  StaffInfo,
  DishStock,
  KitchenStatus,
  Order,
  WarningRecord,
  DailyStat,
  RainLevel,
  OrderStatus,
  TimeoutRisk,
  BoardGroupType
} from '@/types';
import { mockOrders, mockDishStocks, mockDailyStats, initialWeather, initialStaff, initialKitchen } from '@/data/mockData';

interface RainStoreState {
  weather: WeatherInfo;
  staff: StaffInfo;
  dishStocks: DishStock[];
  kitchen: KitchenStatus;
  orders: Order[];
  warnings: WarningRecord[];
  dailyStats: DailyStat[];
  activeGroup: BoardGroupType;
  acknowledgedWarningIds: Set<string>;

  setWeather: (w: Partial<WeatherInfo>) => void;
  setStaff: (s: Partial<StaffInfo>) => void;
  setKitchen: (k: Partial<KitchenStatus>) => void;
  updateDishStock: (id: string, patch: Partial<DishStock>) => void;
  addDishStock: (dish: DishStock) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderRisk: (orderId: string, risk: TimeoutRisk) => void;
  addOrder: (order: Order) => void;
  setActiveGroup: (g: BoardGroupType) => void;
  acknowledgeWarning: (id: string) => void;
  generateWarnings: () => void;
  getGroupedOrders: () => Record<BoardGroupType, Order[]>;
  getLowStockDishes: () => DishStock[];
  getRainyDayStats: () => { avgCookTime: number; avgTimeoutRate: number; avgOrders: number };
}

function calcTimeoutRisk(order: Order, kitchen: KitchenStatus, weather: WeatherInfo): TimeoutRisk {
  const now = Date.now();
  const remaining = order.promisedDeliveryAt - now;
  const extraCook = kitchen.estimatedCookTime - kitchen.avgCookTimeToday;
  const rainPenalty =
    weather.rainLevel === 'heavy' || weather.rainLevel === 'storm' ? 30 * 60 * 1000 :
    weather.rainLevel === 'medium' ? 15 * 60 * 1000 : 0;
  const totalNeed = kitchen.estimatedCookTime * 60 * 1000 + order.distanceKm * 4 * 60 * 1000 + rainPenalty + extraCook * 60 * 1000;

  if (remaining < totalNeed * 0.6) return 'critical';
  if (remaining < totalNeed * 0.8) return 'high';
  if (remaining < totalNeed) return 'medium';
  return 'low';
}

function classifyGroup(order: Order, kitchen: KitchenStatus, staff: StaffInfo, stocks: DishStock[], weather: WeatherInfo): BoardGroupType {
  if (order.status === 'completed' || order.status === 'cancelled') return 'normal';
  const lowStockDishes = stocks.filter(s => s.currentStock <= s.safeStock).map(s => s.id);
  const hasLowStockDish = order.dishes.some(d => lowStockDishes.includes(d.dishId));
  if (hasLowStockDish) return 'lowStock';
  const riderRatio = staff.totalRiders > 0 ? staff.availableRiders / staff.totalRiders : 1;
  const rainAffect = weather.rainLevel === 'heavy' || weather.rainLevel === 'storm';
  if (riderRatio < 0.3 || (rainAffect && riderRatio < 0.5)) return 'noRider';
  if (kitchen.pendingOrderCount > 10 || kitchen.estimatedCookTime > 25) return 'backlog';
  return 'normal';
}

export const useRainStore = create<RainStoreState>((set, get) => ({
  weather: initialWeather,
  staff: initialStaff,
  dishStocks: mockDishStocks,
  kitchen: initialKitchen,
  orders: mockOrders,
  warnings: [],
  dailyStats: mockDailyStats,
  activeGroup: 'normal',
  acknowledgedWarningIds: new Set(),

  setWeather: (w) => set((state) => {
    const newWeather = { ...state.weather, ...w, recordedAt: Date.now() };
    setTimeout(() => get().generateWarnings(), 0);
    return { weather: newWeather };
  }),

  setStaff: (s) => set((state) => ({
    staff: { ...state.staff, ...s, updatedAt: Date.now() }
  })),

  setKitchen: (k) => set((state) => ({
    kitchen: { ...state.kitchen, ...k, updatedAt: Date.now() }
  })),

  updateDishStock: (id, patch) => set((state) => ({
    dishStocks: state.dishStocks.map(d => d.id === id ? { ...d, ...patch } : d)
  })),

  addDishStock: (dish) => set((state) => ({
    dishStocks: [...state.dishStocks, dish]
  })),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(o => {
      if (o.id !== orderId) return o;
      const updated = { ...o, status };
      if (status === 'completed') {
        return { ...updated, timeoutRisk: 'low' as TimeoutRisk };
      }
      return updated;
    })
  })),

  updateOrderRisk: (orderId, risk) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, timeoutRisk: risk } : o)
  })),

  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders]
  })),

  setActiveGroup: (g) => set({ activeGroup: g }),

  acknowledgeWarning: (id) => set((state) => ({
    acknowledgedWarningIds: new Set([...state.acknowledgedWarningIds, id]),
    warnings: state.warnings.map(w => w.id === id ? { ...w, acknowledged: true } : w)
  })),

  generateWarnings: () => {
    const state = get();
    const newWarnings: WarningRecord[] = [];
    const now = Date.now();
    const rid = (t: string) => `${t}-${now}`;

    const { weather, kitchen, staff, dishStocks } = state;

    if (weather.rainLevel === 'heavy' || weather.rainLevel === 'storm' ||
        weather.forecastNextHour === 'heavy' || weather.forecastNextHour === 'storm') {
      newWarnings.push({
        id: rid('rain'),
        type: 'rain',
        level: 'danger',
        title: '强降雨预警',
        message: `当前${weather.rainLevel === 'storm' ? '暴雨' : '大雨'}，预计骑手配送速度下降50%，出餐压力陡增`,
        suggestion: '建议：立即关闭接单30分钟 或 将承诺配送时间延长30分钟',
        createdAt: now,
        acknowledged: false
      });
    } else if (weather.rainLevel === 'medium' || weather.forecastNextHour === 'medium') {
      newWarnings.push({
        id: rid('rain'),
        type: 'rain',
        level: 'warning',
        title: '中雨提示',
        message: '中雨持续，骑手配送会受到一定影响',
        suggestion: '建议：将承诺配送时间延长15分钟，加派1名打包人员',
        createdAt: now,
        acknowledged: false
      });
    }

    if (kitchen.pendingOrderCount > 15 || kitchen.estimatedCookTime > 30) {
      newWarnings.push({
        id: rid('backlog'),
        type: 'backlog',
        level: 'danger',
        title: '订单严重堆积',
        message: `待制作${kitchen.pendingOrderCount}单，预计出餐时间${kitchen.estimatedCookTime}分钟`,
        suggestion: '建议：暂停接单15分钟，紧急调配后厨支援',
        createdAt: now,
        acknowledged: false
      });
    } else if (kitchen.pendingOrderCount > 8 || kitchen.estimatedCookTime > 20) {
      newWarnings.push({
        id: rid('backlog'),
        type: 'backlog',
        level: 'warning',
        title: '订单堆积中',
        message: `待制作${kitchen.pendingOrderCount}单，出餐较慢`,
        suggestion: '建议：后厨加速生产，控制接单节奏',
        createdAt: now,
        acknowledged: false
      });
    }

    const riderRatio = staff.totalRiders > 0 ? staff.availableRiders / staff.totalRiders : 1;
    if (staff.availableRiders <= 2 || riderRatio < 0.25) {
      newWarnings.push({
        id: rid('rider'),
        type: 'noRider',
        level: 'danger',
        title: '骑手严重不足',
        message: `当前仅${staff.availableRiders}名骑手在店，等待取餐订单将超时`,
        suggestion: '建议：联系平台加派骑手，主动联系客户说明情况并赠送优惠券',
        createdAt: now,
        acknowledged: false
      });
    } else if (riderRatio < 0.4) {
      newWarnings.push({
        id: rid('rider'),
        type: 'noRider',
        level: 'warning',
        title: '骑手偏紧',
        message: `可用骑手${staff.availableRiders}/${staff.totalRiders}`,
        suggestion: '建议：关注骑手到店情况，必要时延长配送承诺',
        createdAt: now,
        acknowledged: false
      });
    }

    const lowStock = dishStocks.filter(d => d.currentStock <= d.safeStock * 0.5);
    if (lowStock.length >= 3) {
      newWarnings.push({
        id: rid('stock'),
        type: 'lowStock',
        level: 'danger',
        title: '多菜品告急',
        message: `${lowStock.map(d => d.name).join('、')} 库存接近断货`,
        suggestion: '建议：立即在平台下架这些菜品，紧急联系供应商补货',
        createdAt: now,
        acknowledged: false
      });
    } else if (lowStock.length > 0) {
      newWarnings.push({
        id: rid('stock'),
        type: 'lowStock',
        level: 'warning',
        title: '库存预警',
        message: `${lowStock.map(d => d.name).join('、')} 库存偏低`,
        suggestion: '建议：关注销量，准备下架或补货',
        createdAt: now,
        acknowledged: false
      });
    }

    if (newWarnings.length > 0) {
      set({ warnings: [...newWarnings, ...state.warnings].slice(0, 30) });
    }
  },

  getGroupedOrders: () => {
    const { orders, kitchen, staff, dishStocks, weather } = get();
    const result: Record<BoardGroupType, Order[]> = {
      normal: [],
      backlog: [],
      noRider: [],
      lowStock: []
    };
    orders.forEach(o => {
      if (o.status === 'completed' || o.status === 'cancelled') {
        result.normal.push(o);
        return;
      }
      const group = classifyGroup(o, kitchen, staff, dishStocks, weather);
      result[group].push(o);
    });
    return result;
  },

  getLowStockDishes: () => {
    return get().dishStocks.filter(d => d.currentStock <= d.safeStock);
  },

  getRainyDayStats: () => {
    const rainy = get().dailyStats.filter(d => d.isRainy);
    if (rainy.length === 0) return { avgCookTime: 0, avgTimeoutRate: 0, avgOrders: 0 };
    const avgCookTime = rainy.reduce((s, d) => s + d.avgCookTime, 0) / rainy.length;
    const avgTimeoutRate = rainy.reduce((s, d) => s + d.timeoutRate, 0) / rainy.length;
    const avgOrders = rainy.reduce((s, d) => s + d.totalOrders, 0) / rainy.length;
    return {
      avgCookTime: Math.round(avgCookTime),
      avgTimeoutRate: Math.round(avgTimeoutRate * 100) / 100,
      avgOrders: Math.round(avgOrders)
    };
  }
}));
