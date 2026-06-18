import React from 'react';
import {
  getStatusColor,
  getStatusText,
  getSeverityColor,
  getSeverityText,
} from '../utils/formatters';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'severity';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  className = '',
}) => {
  const color = type === 'severity' ? getSeverityColor(status) : getStatusColor(status);
  const text = type === 'severity' ? getSeverityText(status) : getStatusText(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1.5 ${
          status === 'normal' || status === 'completed' || status === 'resolved'
            ? 'bg-green-500'
            : status === 'warning' || status === 'handling' || status === 'medium'
            ? 'bg-yellow-500'
            : status === 'full' || status === 'high'
            ? 'bg-orange-500'
            : status === 'exception' || status === 'critical'
            ? 'bg-red-500'
            : 'bg-gray-500'
        } ${
          status === 'full' || status === 'critical' ? 'animate-pulse' : ''
        }`}
      />
      {text}
    </span>
  );
};
