import type { Inspection } from '../types';

export function checkRepeatedAnomaly(areaId: string, inspections: Inspection[]): boolean {
  const areaInspections = inspections
    .filter(i => i.areaId === areaId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  if (areaInspections.length < 2) return false;
  return areaInspections.every(i => i.hasAnomaly);
}

export function getAnomalyAreas(inspections: Inspection[]): string[] {
  const areaIds = [...new Set(inspections.map(i => i.areaId))];
  return areaIds.filter(id => checkRepeatedAnomaly(id, inspections));
}

export function hasAnomaly(
  waterPoints: string[],
  wallDampLevel: string,
  drainStatus: string,
  thresholdLeak: boolean
): boolean {
  if (waterPoints.length > 0) return true;
  if (wallDampLevel === 'medium' || wallDampLevel === 'severe') return true;
  if (drainStatus === 'slow' || drainStatus === 'blocked') return true;
  if (thresholdLeak) return true;
  return false;
}
