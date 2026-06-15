import React from 'react';
import type { MedicineStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { getStatusBadgeClass } from '@/utils/statusUtils';

interface StatusBadgeProps {
  status: MedicineStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const statusClass = getStatusBadgeClass(status);
  
  return (
    <span className={`${baseClass} ${statusClass} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  );
};
