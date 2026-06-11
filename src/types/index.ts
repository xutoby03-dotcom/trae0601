export type RainLevel = 'sunny' | 'drizzle' | 'light' | 'medium' | 'heavy' | 'storm';

export type OrderPlatform = 'meituan' | 'eleme' | 'jddj';

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'picked' | 'completed' | 'cancelled';

export type TimeoutRisk = 'low' | 'medium' | 'high' | 'critical';

export type BoardGroupType = 'normal' | 'backlog' | 'noRider' | 'lowStock';

export interface WeatherInfo {
  rainLevel: RainLevel;
  temperature: number;
  windLevel: number;
  forecastNextHour: RainLevel;
  recordedAt: number;
}

export interface StaffInfo {
  totalChefs: number;
  availableChefs: number;
  totalPackers: number;
  availablePackers: number;
  totalRiders: number;
  availableRiders: number;
  updatedAt: number;
}

export interface DishStock {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  safeStock: number;
  todaySold: number;
  isHot: boolean;
}

export interface KitchenStatus {
  estimatedCookTime: number;
  currentOrderCount: number;
  pendingOrderCount: number;
  avgCookTimeToday: number;
  updatedAt: number;
}

export interface Order {
  id: string;
  orderNo: string;
  platform: OrderPlatform;
  customerName: string;
  phone: string;
  address: string;
  distanceKm: number;
  dishes: OrderDish[];
  totalAmount: number;
  isHotFood: boolean;
  timeoutRisk: TimeoutRisk;
  status: OrderStatus;
  createdAt: number;
  promisedDeliveryAt: number;
  estimatedReadyAt: number;
  remark?: string;
}

export interface OrderDish {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  isHot: boolean;
}

export interface WarningRecord {
  id: string;
  type: 'rain' | 'backlog' | 'noRider' | 'lowStock' | 'timeout';
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  suggestion: string;
  createdAt: number;
  acknowledged: boolean;
}

export interface DailyStat {
  date: string;
  isRainy: boolean;
  rainLevel?: RainLevel;
  totalOrders: number;
  timeoutOrders: number;
  timeoutRate: number;
  avgCookTime: number;
  cancelledOrders: number;
  stockOutDishes: string[];
  avgRiderWaitTime: number;
}

export type StockOutRank = {
  dishName: string;
  stockOutCount: number;
  category: string;
};

export const RAIN_LABEL_MAP: Record<RainLevel, string> = {
  sunny: '晴天',
  drizzle: '毛毛雨',
  light: '小雨',
  medium: '中雨',
  heavy: '大雨',
  storm: '暴雨'
};

export const RAIN_EMOJI_MAP: Record<RainLevel, string> = {
  sunny: '☀️',
  drizzle: '🌦️',
  light: '🌧️',
  medium: '🌧️',
  heavy: '⛈️',
  storm: '🌪️'
};

export const PLATFORM_LABEL_MAP: Record<OrderPlatform, string> = {
  meituan: '美团',
  eleme: '饿了么',
  jddj: '京东到家'
};

export const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending: '待接单',
  cooking: '制作中',
  ready: '待取餐',
  picked: '已取餐',
  completed: '已完成',
  cancelled: '已取消'
};

export const RISK_LABEL_MAP: Record<TimeoutRisk, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '极危险'
};

export const GROUP_LABEL_MAP: Record<BoardGroupType, string> = {
  normal: '正常运转',
  backlog: '订单堆积',
  noRider: '骑手不足',
  lowStock: '菜品快断货'
};
