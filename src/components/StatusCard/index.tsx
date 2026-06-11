import React from 'react';
import { cn } from '@/lib/utils';
import type { ShipmentStatus } from '@/store/types';

interface StatusCardProps {
  status: ShipmentStatus;
  count: number;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const statusColors: Record<ShipmentStatus, { bg: string; border: string; hover: string; iconBg: string }> = {
  pending: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    hover: 'hover:border-gray-400',
    iconBg: 'bg-gray-100 text-gray-600',
  },
  shipping: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hover: 'hover:border-amber-400',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  delivered: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hover: 'hover:border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  followup: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:border-purple-400',
    iconBg: 'bg-purple-100 text-purple-600',
  },
};

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  count,
  label,
  icon,
  isActive,
  onClick,
}) => {
  const colors = statusColors[status];
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer',
        colors.bg,
        colors.border,
        colors.hover,
        isActive && 'ring-2 ring-offset-2 ring-blue-500 scale-[1.02]',
        'hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{count}</p>
        </div>
        <div className={cn('p-3 rounded-lg', colors.iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
};
