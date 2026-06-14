import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Inspection, BuildingStats, ResidentStats, CleanupStats, RiskPoint, InspectionStatus } from '@/types';
import { daysBetween } from './date';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateBuildingStats(inspections: Inspection[]): BuildingStats[] {
  const buildingMap = new Map<string, BuildingStats>();

  inspections.forEach((inspection) => {
    const { building, status, isFireExit } = inspection;
    if (!buildingMap.has(building)) {
      buildingMap.set(building, {
        building,
        totalCount: 0,
        pendingCount: 0,
        cleanedCount: 0,
        overdueCount: 0,
        fireExitCount: 0,
      });
    }
    const stats = buildingMap.get(building)!;
    stats.totalCount++;
    
    if (status === 'pending') stats.pendingCount++;
    if (status === 'cleaned') stats.cleanedCount++;
    if (status === 'overdue') stats.overdueCount++;
    if (isFireExit) stats.fireExitCount++;
  });

  return Array.from(buildingMap.values()).sort((a, b) => b.totalCount - a.totalCount);
}

export function calculateResidentStats(inspections: Inspection[]): ResidentStats[] {
  const residentMap = new Map<string, ResidentStats>();

  inspections.forEach((inspection) => {
    const { suspectedResident, building, createdAt } = inspection;
    if (!suspectedResident) return;
    
    if (!residentMap.has(suspectedResident)) {
      residentMap.set(suspectedResident, {
        resident: suspectedResident,
        count: 0,
        building,
        lastOccurrence: createdAt,
      });
    }
    const stats = residentMap.get(suspectedResident)!;
    stats.count++;
    if (new Date(createdAt) > new Date(stats.lastOccurrence)) {
      stats.lastOccurrence = createdAt;
    }
  });

  return Array.from(residentMap.values())
    .filter((r) => r.count >= 2)
    .sort((a, b) => b.count - a.count);
}

export function calculateCleanupStats(inspections: Inspection[]): CleanupStats {
  const cleaned = inspections.filter((i) => i.status === 'cleaned' && i.cleanedAt);
  
  let totalDays = 0;
  let within3Days = 0;
  let within7Days = 0;
  let over7Days = 0;

  cleaned.forEach((inspection) => {
    if (inspection.cleanedAt) {
      const days = daysBetween(inspection.createdAt, inspection.cleanedAt);
      totalDays += days;
      
      if (days <= 3) within3Days++;
      else if (days <= 7) within7Days++;
      else over7Days++;
    }
  });

  return {
    avgDays: cleaned.length > 0 ? Math.round((totalDays / cleaned.length) * 10) / 10 : 0,
    within3Days,
    within7Days,
    over7Days,
    totalCleaned: cleaned.length,
  };
}

export function calculateRiskPoints(inspections: Inspection[]): RiskPoint[] {
  const locationMap = new Map<string, RiskPoint & { count: number }>();

  inspections.forEach((inspection) => {
    const key = `${inspection.building}-${inspection.floor}-${inspection.location}`;
    if (!locationMap.has(key)) {
      locationMap.set(key, {
        location: inspection.location,
        building: inspection.building,
        floor: inspection.floor,
        count: 0,
        riskLevel: 'low',
        isFireExit: inspection.isFireExit,
        lastOccurrence: inspection.createdAt,
      });
    }
    const point = locationMap.get(key)!;
    point.count++;
    if (new Date(inspection.createdAt) > new Date(point.lastOccurrence)) {
      point.lastOccurrence = inspection.createdAt;
    }
    if (inspection.isFireExit) {
      point.isFireExit = true;
    }
  });

  const points = Array.from(locationMap.values()).map((point) => {
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    if (point.isFireExit || point.count >= 3) riskLevel = 'high';
    else if (point.count >= 2) riskLevel = 'medium';
    return { ...point, riskLevel };
  });

  return points.sort((a, b) => {
    const levelOrder = { high: 0, medium: 1, low: 2 };
    if (levelOrder[a.riskLevel] !== levelOrder[b.riskLevel]) {
      return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
    }
    return b.count - a.count;
  });
}

export function filterInspections(
  inspections: Inspection[],
  filters: {
    building?: string;
    status?: InspectionStatus | 'all';
    itemType?: string;
    search?: string;
    isFireExit?: boolean;
  }
): Inspection[] {
  return inspections.filter((inspection) => {
    if (filters.building && filters.building !== 'all' && inspection.building !== filters.building) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && inspection.status !== filters.status) {
      return false;
    }
    if (filters.itemType && filters.itemType !== 'all' && inspection.itemType !== filters.itemType) {
      return false;
    }
    if (filters.isFireExit !== undefined && inspection.isFireExit !== filters.isFireExit) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        inspection.location.toLowerCase().includes(searchLower) ||
        inspection.suspectedResident.toLowerCase().includes(searchLower) ||
        inspection.building.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
}
