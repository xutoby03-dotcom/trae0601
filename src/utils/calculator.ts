import type { Item, Participant, Adjustment, Settlement, AllocationMethod } from '@/types';

export function calculateAllocation(
  items: Item[],
  participants: Participant[],
  totalShipping: number,
  totalTax: number,
  method: AllocationMethod,
  exchangeRate: number
): Map<string, { shipping: number; tax: number }> {
  const allocation = new Map<string, { shipping: number; tax: number }>();

  participants.forEach((p) => {
    allocation.set(p.id, { shipping: 0, tax: 0 });
  });

  const validItems = items.filter((item) => !item.isReturned);

  let totalWeight = 0;
  let totalAmount = 0;

  validItems.forEach((item) => {
    const amountRMB = item.price * item.quantity * exchangeRate;
    totalWeight += item.weight * item.quantity;
    totalAmount += amountRMB;
  });

  if (totalAmount === 0 && method === 'by_amount') {
    return allocation;
  }
  if (totalWeight === 0 && method === 'by_weight') {
    return allocation;
  }

  validItems.forEach((item) => {
    const amountRMB = item.price * item.quantity * exchangeRate;
    const itemWeight = item.weight * item.quantity;

    const share = method === 'by_amount' ? amountRMB / totalAmount : itemWeight / totalWeight;

    const current = allocation.get(item.buyerId)!;
    current.shipping += totalShipping * share;
    current.tax += totalTax * share;
  });

  return allocation;
}

export function calculateAdjustmentShare(
  adjustment: Adjustment,
  participants: Participant[]
): Map<string, number> {
  const share = new Map<string, number>();

  if (adjustment.targetParticipantId) {
    participants.forEach((p) => {
      share.set(p.id, p.id === adjustment.targetParticipantId ? adjustment.amount : 0);
    });
  } else {
    const perPerson = adjustment.amount / participants.length;
    participants.forEach((p) => {
      share.set(p.id, perPerson);
    });
  }

  return share;
}

export function calculateParticipantItemsTotal(
  participantId: string,
  items: Item[],
  exchangeRate: number
): number {
  return items
    .filter((item) => item.buyerId === participantId && !item.isReturned)
    .reduce((sum, item) => sum + item.price * item.quantity * exchangeRate, 0);
}

export function calculateSettlements(
  orderId: string,
  participants: Participant[],
  items: Item[],
  adjustments: Adjustment[],
  totalShipping: number,
  totalTax: number,
  allocationMethod: AllocationMethod,
  exchangeRate: number,
  payments: Map<string, number> = new Map(),
  pickupStatus: Map<string, boolean> = new Map()
): Settlement[] {
  const allocation = calculateAllocation(
    items,
    participants,
    totalShipping,
    totalTax,
    allocationMethod,
    exchangeRate
  );

  const adjustmentShares = new Map<string, number>();
  participants.forEach((p) => adjustmentShares.set(p.id, 0));

  adjustments.forEach((adj) => {
    const shares = calculateAdjustmentShare(adj, participants);
    shares.forEach((amount, pid) => {
      adjustmentShares.set(pid, (adjustmentShares.get(pid) || 0) + amount);
    });
  });

  return participants.map((p) => {
    const itemsTotal = calculateParticipantItemsTotal(p.id, items, exchangeRate);
    const alloc = allocation.get(p.id) || { shipping: 0, tax: 0 };
    const adjShare = adjustmentShares.get(p.id) || 0;
    const amountPaid = payments.get(p.id) || 0;
    const totalPayable = itemsTotal + alloc.shipping + alloc.tax + adjShare;
    const refundDue = amountPaid > totalPayable ? amountPaid - totalPayable : 0;
    const isPaid = amountPaid >= totalPayable && totalPayable > 0;

    return {
      orderId,
      participantId: p.id,
      itemsTotal,
      shippingShare: alloc.shipping,
      taxShare: alloc.tax,
      adjustmentShare: adjShare,
      totalPayable: Math.max(0, totalPayable),
      amountPaid,
      refundDue,
      isPickedUp: pickupStatus.get(p.id) || false,
      isPaid,
    };
  });
}

export function calculateOrderTotal(
  items: Item[],
  totalShipping: number,
  totalTax: number,
  adjustments: Adjustment[],
  exchangeRate: number
): { itemsTotal: number; grandTotal: number } {
  const itemsTotal = items
    .filter((item) => !item.isReturned)
    .reduce((sum, item) => sum + item.price * item.quantity * exchangeRate, 0);

  const adjustmentsTotal = adjustments.reduce((sum, adj) => sum + adj.amount, 0);

  return {
    itemsTotal,
    grandTotal: itemsTotal + totalShipping + totalTax + adjustmentsTotal,
  };
}
