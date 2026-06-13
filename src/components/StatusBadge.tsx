import React from 'react';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'device' | 'lending' | 'compensation';
  className?: string;
}

const statusStyles: Record<string, Record<string, string>> = {
  device: {
    available: 'bg-green-100 text-green-700 border-green-200',
    lent: 'bg-blue-100 text-blue-700 border-blue-200',
    maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
    low_battery: 'bg-red-100 text-red-700 border-red-200',
  },
  lending: {
    active: 'bg-blue-100 text-blue-700 border-blue-200',
    returned: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  },
  compensation: {
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    paid: 'bg-green-100 text-green-700 border-green-200',
    waived: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

const statusText: Record<string, Record<string, string>> = {
  device: {
    available: '可借',
    lent: '借出中',
    maintenance: '维护中',
    low_battery: '低电量待充',
  },
  lending: {
    active: '借出中',
    returned: '已归还',
    overdue: '超时未还',
  },
  compensation: {
    pending: '待处理',
    paid: '已赔付',
    waived: '已豁免',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'device',
  className,
}) => {
  const styles = statusStyles[type]?.[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const text = statusText[type]?.[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60" />
      {text}
    </span>
  );
};
