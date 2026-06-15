import { OrderStatus, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/types';
import type { Order, Chef } from '@/types';

export const isOrderEmergency = (order: Order, now: Date = new Date()): boolean => {
  const pickup = new Date(order.pickupTime);
  const diffMs = pickup.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const pipingIndex = ORDER_STATUS_FLOW.indexOf(OrderStatus.PIPING);
  return diffHours < 2 && currentIndex < pipingIndex;
};

export const isOrderRisk = (order: Order, now: Date = new Date()): boolean => {
  const pickup = new Date(order.pickupTime);
  const diffMs = pickup.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const pipingIndex = ORDER_STATUS_FLOW.indexOf(OrderStatus.PIPING);
  return order.complexity >= 4 && diffHours < 4 && currentIndex < pipingIndex;
};

export const canAdvanceStatus = (order: Order, targetStatus: OrderStatus): boolean => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const targetIndex = ORDER_STATUS_FLOW.indexOf(targetStatus);
  return targetIndex === currentIndex + 1;
};

export const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index < ORDER_STATUS_FLOW.length - 1) {
    return ORDER_STATUS_FLOW[index + 1];
  }
  return null;
};

export const formatPickupTime = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const getCountdownText = (isoString: string, now: Date = new Date()): string => {
  const d = new Date(isoString);
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return '已到取货时间';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}小时${minutes}分钟后取货`;
  return `${minutes}分钟后取货`;
};

export const getComplexityStars = (complexity: number): string => {
  return '★'.repeat(complexity) + '☆'.repeat(5 - complexity);
};

export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.EMBRYO_READY]: 'bg-amber-100 text-amber-800 border-amber-300',
    [OrderStatus.FILLING_DONE]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [OrderStatus.CRUSTING]: 'bg-orange-100 text-orange-800 border-orange-300',
    [OrderStatus.PIPING]: 'bg-pink-100 text-pink-800 border-pink-300',
    [OrderStatus.CHILLED]: 'bg-matcha-500 text-white border-matcha-600',
  };
  return colors[status];
};

export const sortOrdersByPickup = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime());
};

export const getChefPendingOrders = (chef: Chef, orders: Order[]): Order[] => {
  return orders.filter(
    (o) => o.chefId === chef.id && o.status !== OrderStatus.CHILLED
  );
};

export const getChefCompletedOrders = (chef: Chef, orders: Order[]): Order[] => {
  return orders.filter(
    (o) => o.chefId === chef.id && o.status === OrderStatus.CHILLED
  );
};

export const estimateChefFinishTime = (chef: Chef, orders: Order[]): Date | null => {
  const pending = getChefPendingOrders(chef, orders);
  if (pending.length === 0) return null;
  const baseTime = new Date();
  const avgMinutesPerStep = 25;
  let totalMinutes = 0;
  pending.forEach((order) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
    const remainingSteps = ORDER_STATUS_FLOW.length - 1 - currentIndex;
    totalMinutes += remainingSteps * avgMinutesPerStep * (1 + (5 - chef.skillLevel) * 0.1);
    totalMinutes += order.complexity * 10;
  });
  return new Date(baseTime.getTime() + totalMinutes * 60 * 1000);
};

export const getCongestionData = (orders: Order[], now: Date = new Date()): { time: Date; count: number }[] => {
  const result: { time: Date; count: number }[] = [];
  const startHour = now.getHours();
  const startMin = now.getMinutes() < 30 ? 0 : 30;
  for (let i = 0; i < 16; i++) {
    const t = new Date(now);
    t.setHours(startHour, startMin + i * 30, 0, 0);
    const count = orders.filter((o) => {
      const pickup = new Date(o.pickupTime);
      const diff = pickup.getTime() - t.getTime();
      return diff >= 0 && diff < 30 * 60 * 1000 && o.status !== OrderStatus.CHILLED;
    }).length;
    result.push({ time: t, count });
  }
  return result;
};

export const getAvailableChefs = (order: Order, chefs: Chef[]): Chef[] => {
  if (order.referenceImageUrl) return chefs;
  return chefs.filter((c) => !c.isRookie);
};

export { ORDER_STATUS_LABELS };
