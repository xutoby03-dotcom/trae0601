import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { UmbrellaStatus, ClaimStatus } from '@/types';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'default';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
  size = 'md',
}) => {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border',
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: UmbrellaStatus }> = ({ status }) => {
  const config: Record<UmbrellaStatus, { variant: BadgeProps['variant']; label: string }> = {
    pending: { variant: 'pending', label: '待认领' },
    claimed: { variant: 'success', label: '已认领' },
    shared: { variant: 'info', label: '共享中' },
    scrapped: { variant: 'danger', label: '已报废' },
  };

  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};

export const ClaimStatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  const config: Record<ClaimStatus, { variant: BadgeProps['variant']; label: string }> = {
    pending: { variant: 'pending', label: '待审核' },
    approved: { variant: 'success', label: '已通过' },
    rejected: { variant: 'danger', label: '已驳回' },
  };

  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};
