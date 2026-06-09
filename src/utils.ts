import { GroupOrder, Participant, OrderItem, ItemStatus } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline).getTime() < Date.now();
}

export function getTimeRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return '已截止';
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `剩余 ${hours}小时${minutes % 60}分`;
  if (minutes > 0) return `剩余 ${minutes}分钟`;
  return `剩余 ${Math.floor(diff / 1000)}秒`;
}

export function calculateParticipantShare(
  order: GroupOrder,
  participant: Participant
): number {
  const itemsTotal = participant.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (itemsTotal === 0) return 0;

  const allItemsTotal = order.participants.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );

  const participantCount = order.participants.filter(
    p => p.items.length > 0
  ).length;

  let deliveryShare = 0;
  if (participantCount > 0) {
    deliveryShare = order.deliveryFee / participantCount;
  }

  let discountShare = 0;
  if (allItemsTotal >= order.discountThreshold && order.discountAmount > 0) {
    discountShare = (itemsTotal / allItemsTotal) * order.discountAmount;
  }

  return Math.max(0, itemsTotal - discountShare + deliveryShare);
}

export function calculateOrderTotal(order: GroupOrder): number {
  return order.participants.reduce(
    (sum, p) => sum + calculateParticipantShare(order, p),
    0
  );
}

export function hasDuplicateItem(participant: Participant, menuItemId: string): boolean {
  return participant.items.some(i => i.menuItemId === menuItemId);
}

export function createOrderItem(
  menuItemId: string,
  menuItemName: string,
  price: number,
  notes: string[] = [],
  needInvoice: boolean = false
): OrderItem {
  return {
    id: generateId(),
    menuItemId,
    menuItemName,
    price,
    quantity: 1,
    notes,
    needInvoice,
    status: 'ordered' as ItemStatus,
  };
}

export function getItemStatusText(status: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    ordered: '已下单',
    paid: '已付款',
    picked_up: '已取餐',
    missing: '缺餐',
    wrong: '错餐',
  };
  return map[status];
}

export function getOrderStatusText(status: GroupOrder['status']): string {
  const map: Record<string, string> = {
    collecting: '拼单中',
    ordered: '已下单',
    delivered: '已送达',
    closed: '已关闭',
  };
  return map[status] || status;
}

export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}
