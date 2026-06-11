import React from 'react';
import type { ShipmentStatus } from '@/store/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const statusConfig: Record<ShipmentStatus, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: '待寄出', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  shipping: { label: '运输中', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  delivered: { label: '已签收', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  followup: { label: '要回访', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </span>
  );
};
