import { EquipmentStatus, TaskStatus, InspectionStatus, EquipmentType } from '@/types';

export const getEquipmentStatusColor = (status: EquipmentStatus): string => {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'abnormal':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'maintaining':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getInspectionStatusColor = (status: InspectionStatus): string => {
  return status === 'pass'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

export const getEquipmentTypeIcon = (type: EquipmentType): string => {
  switch (type) {
    case 'lifebuoy':
      return 'LifeBuoy';
    case 'rescue_pole':
      return 'Ruler';
    case 'warning_sign':
      return 'TriangleAlert';
    case 'first_aid_kit':
      return 'Heart';
    case 'camera':
      return 'Camera';
    default:
      return 'Package';
  }
};

export const getPassRateColor = (rate: number): string => {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const getPassRateBarColor = (rate: number): string => {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};
