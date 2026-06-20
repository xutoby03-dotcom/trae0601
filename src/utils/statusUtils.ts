import type { InspectionItem, InspectionStatus } from '@/types';

export function getOverallStatus(items: InspectionItem[]): InspectionStatus {
  const hasCritical = items.some(item => item.status === 'critical');
  const hasWarning = items.some(item => item.status === 'warning');
  
  if (hasCritical) return 'critical';
  if (hasWarning) return 'warning';
  return 'normal';
}

export function isCriticalHazard(items: InspectionItem[]): boolean {
  const criticalItems = items.filter(item => {
    if (item.status === 'critical') {
      if (item.severity && item.severity >= 4) return true;
      if (item.type === 'water_accumulation') return true;
    }
    if (item.status === 'warning' && item.type === 'water_accumulation') return true;
    return false;
  });

  if (criticalItems.length > 0) return true;

  const warningOrWorse = items.filter(item => item.status !== 'normal');
  if (warningOrWorse.length >= 2) return true;

  return false;
}

export function getStatusColorClass(status: InspectionStatus): string {
  switch (status) {
    case 'normal':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'warning':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'critical':
      return 'text-rose-600 bg-rose-50 border-rose-200';
  }
}

export function getStatusBgClass(status: InspectionStatus): string {
  switch (status) {
    case 'normal':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'critical':
      return 'bg-rose-500';
  }
}

export function getClassroomStatusColorClass(status: string): string {
  switch (status) {
    case 'normal':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'suspended':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'maintenance':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getRepairStatusColorClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    case 'in_progress':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'completed':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'recheck_failed':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}
