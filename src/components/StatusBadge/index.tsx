import { ReactNode } from 'react';
import { EquipmentStatus, TaskStatus, InspectionStatus, EquipmentType } from '@/types';
import { EquipmentStatusLabels, TaskStatusLabels, InspectionStatusLabels, EquipmentTypeLabels } from '@/types';
import { getEquipmentStatusColor, getTaskStatusColor, getInspectionStatusColor } from '@/utils/statusUtils';

interface StatusBadgeProps {
  type: 'equipment' | 'task' | 'inspection';
  status: EquipmentStatus | TaskStatus | InspectionStatus;
}

export default function StatusBadge({ type, status }: StatusBadgeProps) {
  let label = '';
  let colorClass = '';

  if (type === 'equipment') {
    label = EquipmentStatusLabels[status as EquipmentStatus];
    colorClass = getEquipmentStatusColor(status as EquipmentStatus);
  } else if (type === 'task') {
    label = TaskStatusLabels[status as TaskStatus];
    colorClass = getTaskStatusColor(status as TaskStatus);
  } else {
    label = InspectionStatusLabels[status as InspectionStatus];
    colorClass = getInspectionStatusColor(status as InspectionStatus);
  }

  return (
    <span className={`badge border ${colorClass}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'normal' || status === 'completed' || status === 'pass'
            ? 'bg-green-500'
            : status === 'abnormal' || status === 'fail'
            ? 'bg-red-500'
            : 'bg-yellow-500'
        }`}
      />
      {label}
    </span>
  );
}

interface TypeBadgeProps {
  type: EquipmentType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colors: Record<EquipmentType, string> = {
    lifebuoy: 'bg-orange-50 text-orange-700 border-orange-200',
    rescue_pole: 'bg-blue-50 text-blue-700 border-blue-200',
    warning_sign: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    first_aid_kit: 'bg-red-50 text-red-700 border-red-200',
    camera: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span className={`badge border ${colors[type]}`}>
      {EquipmentTypeLabels[type]}
    </span>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 text-center max-w-md">{description}</p>}
      {action}
    </div>
  );
}
