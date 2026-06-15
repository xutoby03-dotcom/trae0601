import { ReturnOrder, ColumnType, ReturnStatus } from '@/types/return';
import { isTodayOrPast, isPastDeadline, daysUntil } from './dateUtils';
import { parseISO, differenceInDays } from 'date-fns';

export function getColumnType(order: ReturnOrder): ColumnType | null {
  if (order.status === 'completed') return null;

  if (order.status === 'refund_pending') {
    return 'refund_followup';
  }

  if (order.status === 'shipment_pending' && !order.trackingNumber) {
    return 'need_tracking';
  }

  if (order.status === 'pending') {
    if (isTodayOrPast(order.applicationDeadline)) {
      return 'today_must_handle';
    }
    if (isTodayOrPast(order.shipDeadline)) {
      return 'today_must_handle';
    }
  }

  if (order.status === 'shipment_pending') {
    if (isTodayOrPast(order.shipDeadline)) {
      return 'today_must_handle';
    }
  }

  if (order.status === 'shipment_pending' && order.trackingNumber) {
    return 'refund_followup';
  }

  if (order.status === 'pending') {
    const appDays = daysUntil(order.applicationDeadline);
    if (appDays <= 3) return 'today_must_handle';
  }

  return null;
}

export function getOrdersByColumn(orders: ReturnOrder[]): Record<ColumnType, ReturnOrder[]> {
  const result: Record<ColumnType, ReturnOrder[]> = {
    today_must_handle: [],
    need_tracking: [],
    refund_followup: [],
  };

  orders.forEach((order) => {
    const column = getColumnType(order);
    if (column) {
      result[column].push(order);
    }
  });

  result.today_must_handle.sort((a, b) => {
    const aDate = parseISO(
      daysUntil(a.applicationDeadline) <= daysUntil(a.shipDeadline)
        ? a.applicationDeadline
        : a.shipDeadline
    );
    const bDate = parseISO(
      daysUntil(b.applicationDeadline) <= daysUntil(b.shipDeadline)
        ? b.applicationDeadline
        : b.shipDeadline
    );
    return aDate.getTime() - bDate.getTime();
  });

  return result;
}

export function hasUrgentReminder(order: ReturnOrder): boolean {
  if (isPastDeadline(order.applicationDeadline) && order.status === 'pending') {
    return true;
  }
  if (isPastDeadline(order.shipDeadline) && order.status !== 'refund_pending' && order.status !== 'completed') {
    return true;
  }
  if (order.status === 'refund_pending' && order.refundApplyDate) {
    const daysSinceApply = differenceInDays(new Date(), parseISO(order.refundApplyDate));
    if (daysSinceApply > order.refundPromiseDays) {
      return true;
    }
  }
  return false;
}

export function hasWarningReminder(order: ReturnOrder): boolean {
  if (hasUrgentReminder(order)) return false;

  const appDays = daysUntil(order.applicationDeadline);
  if (appDays >= 0 && appDays <= 2 && order.status === 'pending') {
    return true;
  }

  const shipDays = daysUntil(order.shipDeadline);
  if (shipDays >= 0 && shipDays <= 2 && order.status !== 'refund_pending' && order.status !== 'completed') {
    return true;
  }

  return false;
}

export function getNextStatus(current: ReturnStatus): ReturnStatus | null {
  switch (current) {
    case 'pending':
      return 'shipment_pending';
    case 'shipment_pending':
      return 'refund_pending';
    case 'refund_pending':
      return 'completed';
    default:
      return null;
  }
}

export function getPrevStatus(current: ReturnStatus): ReturnStatus | null {
  switch (current) {
    case 'shipment_pending':
      return 'pending';
    case 'refund_pending':
      return 'shipment_pending';
    case 'completed':
      return 'refund_pending';
    default:
      return null;
  }
}

export function getStatusLabel(status: ReturnStatus): string {
  const labels: Record<ReturnStatus, string> = {
    pending: '待申请',
    shipment_pending: '待寄出',
    refund_pending: '退款中',
    completed: '已完成',
  };
  return labels[status];
}

export function getColumnLabel(column: ColumnType): string {
  const labels: Record<ColumnType, string> = {
    today_must_handle: '今天必须处理',
    need_tracking: '还差快递单',
    refund_followup: '退款跟进',
  };
  return labels[column];
}
