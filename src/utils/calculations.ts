import type { Member, Supply, Assignment } from '@/types';

export const STRENGTH_BASE_LOAD_KG = 2.5;
export const CAPACITY_SAFETY_FACTOR = 0.8;

export function getRecommendedLoadKg(strengthLevel: number): number {
  return strengthLevel * STRENGTH_BASE_LOAD_KG;
}

export function getSafeCapacityKg(backpackCapacityKg: number): number {
  return backpackCapacityKg * CAPACITY_SAFETY_FACTOR;
}

export function getMemberTotalWeightGrams(
  memberId: string,
  assignments: Assignment[],
  supplies: Supply[]
): number {
  return assignments
    .filter((a) => a.memberId === memberId)
    .reduce((total, a) => {
      const supply = supplies.find((s) => s.id === a.supplyId);
      if (!supply) return total;
      const availableQuantity = Math.max(0, a.quantityAssigned - a.usedSegments.length);
      return total + supply.weightGrams * availableQuantity;
    }, 0);
}

export type LoadStatus = 'normal' | 'warning' | 'overload';

export function getLoadStatus(
  actualGrams: number,
  recommendedKg: number
): LoadStatus {
  const actualKg = actualGrams / 1000;
  const ratio = actualKg / recommendedKg;
  if (ratio > 1) return 'overload';
  if (ratio >= 0.8) return 'warning';
  return 'normal';
}

export function getLoadRatioPercent(
  actualGrams: number,
  recommendedKg: number
): number {
  return Math.min((actualGrams / 1000 / recommendedKg) * 100, 150);
}

export function getSupplyAssignedQuantity(
  supplyId: string,
  assignments: Assignment[]
): number {
  return assignments
    .filter((a) => a.supplyId === supplyId)
    .reduce((sum, a) => sum + a.quantityAssigned, 0);
}

export function getSupplyRemainingQuantity(
  supply: Supply,
  assignments: Assignment[]
): number {
  return supply.quantity - getSupplyAssignedQuantity(supply.id, assignments);
}

export function getUnassignedSupplies(
  supplies: Supply[],
  assignments: Assignment[]
): Supply[] {
  return supplies.filter((s) => getSupplyRemainingQuantity(s, assignments) > 0);
}

export function getUnconfirmedMembers(members: Member[]): Member[] {
  return members.filter((m) => !m.confirmed);
}

export function getMemberAssignments(
  memberId: string,
  assignments: Assignment[]
): Assignment[] {
  return assignments.filter((a) => a.memberId === memberId);
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toFixed(1)}kg`;
  }
  return `${grams}g`;
}
