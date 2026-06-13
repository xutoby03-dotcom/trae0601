import type { RepairOrder, RepairStatus } from "@/types";

const STATUS_PRIORITY: Record<RepairStatus, number> = {
  pending: 0,
  processing: 1,
  waiting_parts: 2,
  completed: 3,
  scrapped: 4,
};

export function compareRepairPriority(a: RepairOrder, b: RepairOrder): number {
  if (a.affectClass !== b.affectClass) {
    return a.affectClass ? -1 : 1;
  }

  if (a.impactLevel !== b.impactLevel) {
    return b.impactLevel - a.impactLevel;
  }

  const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  if (statusDiff !== 0) {
    return statusDiff;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortRepairsByPriority(repairs: RepairOrder[]): RepairOrder[] {
  return [...repairs].sort(compareRepairPriority);
}

export function getUrgencyLabel(repair: RepairOrder): string {
  if (repair.affectClass && repair.impactLevel >= 4) return "紧急";
  if (repair.affectClass) return "较高";
  if (repair.impactLevel >= 4) return "较高";
  if (repair.impactLevel >= 3) return "普通";
  return "较低";
}

export function getUrgencyColor(repair: RepairOrder): string {
  const label = getUrgencyLabel(repair);
  switch (label) {
    case "紧急":
      return "text-brick-600 bg-brick-500/10";
    case "较高":
      return "text-amber-600 bg-amber-500/10";
    case "普通":
      return "text-blue-700 bg-blue-500/10";
    default:
      return "text-slate-600 bg-slate-500/10";
  }
}
