import type { SplitRecord, Member } from '../types';

export function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateEqualSplit(totalAmount: number, memberIds: string[]): SplitRecord[] {
  const perPerson = Number((totalAmount / memberIds.length).toFixed(2));
  const remainder = Number((totalAmount - perPerson * memberIds.length).toFixed(2));

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: index === 0 ? perPerson + remainder : perPerson,
    isPaid: false,
  }));
}

export function calculateCustomSplit(
  totalAmount: number,
  customAmounts: Record<string, number>
): SplitRecord[] {
  return Object.entries(customAmounts).map(([memberId, amount]) => ({
    memberId,
    amount,
    isPaid: false,
  }));
}

export function getTotalSplitAmount(splits: SplitRecord[]): number {
  return splits.reduce((sum, s) => sum + s.amount, 0);
}

export function calculateOverBudget(price: number, maxBudget: number): number {
  return Math.max(0, price - maxBudget);
}
