export type TempZone = 'frozen' | 'refrigerated' | 'normal';
export type OrderStatus = 'pending' | 'picked' | 'timeout';
export type PickupSlot = 'morning' | 'noon' | 'afternoon' | 'evening';

export interface Product {
  id: string;
  name: string;
  spec: string;
  tempZone: TempZone;
  arrivalTime: string;
  supplier: string;
  boxNumber: string;
  photo?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  customerName: string;
  phoneLast4: string;
  quantity: number;
  pickupSlot: PickupSlot;
  hasIceBag: boolean;
  status: OrderStatus;
  createdAt: string;
}

export interface Inspection {
  id: string;
  productId: string;
  temperature: number;
  hasDamage: boolean;
  damageNote?: string;
  hasMelt: boolean;
  meltNote?: string;
  shortageQuantity: number;
  shortageNote?: string;
  photos: string[];
  inspectedAt: string;
}

export interface PickupRecord {
  id: string;
  orderId: string;
  pickedAt: string;
  hasException: boolean;
  exceptionNote?: string;
  photos: string[];
}

export const PICKUP_SLOT_LABELS: Record<PickupSlot, string> = {
  morning: '上午 09:00-12:00',
  noon: '中午 12:00-14:00',
  afternoon: '下午 14:00-18:00',
  evening: '晚间 18:00-21:00',
};

export const TEMP_ZONE_LABELS: Record<TempZone, string> = {
  frozen: '冷冻 (-18°C以下)',
  refrigerated: '冷藏 (0-4°C)',
  normal: '常温',
};

export const TEMP_ZONE_COLORS: Record<TempZone, string> = {
  frozen: 'bg-sky-500',
  refrigerated: 'bg-cyan-500',
  normal: 'bg-stone-500',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待取货',
  picked: '已取货',
  timeout: '已超时',
};
