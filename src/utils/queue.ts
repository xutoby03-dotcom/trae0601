import type { CustomerOrder } from '../types';

export function enqueueOrder(
  order: CustomerOrder,
  queue: CustomerOrder[]
): CustomerOrder[] {
  if (order.isPriority) {
    const nonPriorityIndex = queue.findIndex((o) => !o.isPriority);
    if (nonPriorityIndex === -1) {
      return [...queue, order];
    }
    return [
      ...queue.slice(0, nonPriorityIndex),
      order,
      ...queue.slice(nonPriorityIndex),
    ];
  }
  return [...queue, order];
}

export function handleTimeout(
  order: CustomerOrder,
  queue: CustomerOrder[]
): { updatedOrder: CustomerOrder; newQueue: CustomerOrder[] } {
  const updatedOrder: CustomerOrder = {
    ...order,
    queueStatus: 'waiting',
    callCount: order.callCount + 1,
    calledAt: undefined,
  };
  const filteredQueue = queue.filter((o) => o.id !== order.id);
  const newQueue = [...filteredQueue, updatedOrder];
  return { updatedOrder, newQueue };
}

export function calculateEstimatedWaitTime(
  position: number,
  avgTimePerOrder: number = 45
): string {
  const totalSeconds = position * avgTimePerOrder;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `约 ${seconds} 秒`;
  }
  if (seconds === 0) {
    return `约 ${minutes} 分钟`;
  }
  return `约 ${minutes} 分 ${seconds} 秒`;
}

export const CALL_TIMEOUT_MS = 3 * 60 * 1000;

export function isCallTimedOut(calledAt?: string): boolean {
  if (!calledAt) return false;
  return Date.now() - new Date(calledAt).getTime() > CALL_TIMEOUT_MS;
}
