import { FURNITURE_STATUS_LABELS, REPAIR_STATUS_LABELS, MAINTENANCE_STATUS_LABELS, SEVERITY_LABELS, INSPECTION_RESULT_LABELS } from '../types';
import type { FurnitureStatus, RepairStatus, MaintenanceStatus, Severity, InspectionResult } from '../types';

interface StatusBadgeProps {
  type: 'furniture' | 'repair' | 'maintenance' | 'severity' | 'inspection';
  status: string;
}

const furnitureColors: Record<FurnitureStatus, string> = {
  normal: 'bg-green-100 text-green-800',
  pending_repair: 'bg-orange-100 text-orange-800',
  under_maintenance: 'bg-blue-100 text-blue-800',
  out_of_service: 'bg-red-100 text-red-800',
};

const repairColors: Record<RepairStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const maintenanceColors: Record<MaintenanceStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  verified: 'bg-secondary-100 text-secondary-800',
};

const severityColors: Record<Severity, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const inspectionColors: Record<InspectionResult, string> = {
  normal: 'bg-green-100 text-green-800',
  issue: 'bg-yellow-100 text-yellow-800',
  out_of_service: 'bg-red-100 text-red-800',
};

export function StatusBadge({ type, status }: StatusBadgeProps) {
  let label = '';
  let colorClass = '';

  switch (type) {
    case 'furniture':
      label = FURNITURE_STATUS_LABELS[status as FurnitureStatus] || status;
      colorClass = furnitureColors[status as FurnitureStatus] || 'bg-gray-100 text-gray-800';
      break;
    case 'repair':
      label = REPAIR_STATUS_LABELS[status as RepairStatus] || status;
      colorClass = repairColors[status as RepairStatus] || 'bg-gray-100 text-gray-800';
      break;
    case 'maintenance':
      label = MAINTENANCE_STATUS_LABELS[status as MaintenanceStatus] || status;
      colorClass = maintenanceColors[status as MaintenanceStatus] || 'bg-gray-100 text-gray-800';
      break;
    case 'severity':
      label = SEVERITY_LABELS[status as Severity] || status;
      colorClass = severityColors[status as Severity] || 'bg-gray-100 text-gray-800';
      break;
    case 'inspection':
      label = INSPECTION_RESULT_LABELS[status as InspectionResult] || status;
      colorClass = inspectionColors[status as InspectionResult] || 'bg-gray-100 text-gray-800';
      break;
  }

  return (
    <span className={`badge ${colorClass}`}>
      {label}
    </span>
  );
}
