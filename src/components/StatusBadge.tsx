import React from 'react';
import { Tag } from 'antd';
import { getAnomalyStatusText, getInspectionStatusText } from '../utils/helpers';
import type { AnomalyStatus, InspectionStatus } from '../types';

interface StatusBadgeProps {
  type: 'anomaly' | 'inspection';
  status: AnomalyStatus | InspectionStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  if (type === 'inspection') {
    const color = status === 'normal' ? 'success' : 'error';
    return <Tag color={color}>{getInspectionStatusText(status)}</Tag>;
  }

  const colors: Record<AnomalyStatus, string> = {
    pending: 'warning',
    reported: 'processing',
    reviewed: 'success',
  };

  return <Tag color={colors[status as AnomalyStatus]}>{getAnomalyStatusText(status)}</Tag>;
};

export default StatusBadge;
