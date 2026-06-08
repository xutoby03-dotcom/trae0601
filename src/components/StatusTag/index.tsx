import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { RequestStatus } from '@/types/pickup';
import styles from './index.module.scss';

interface StatusTagProps {
  status: RequestStatus;
}

const statusConfig: Record<RequestStatus, { label: string; type: string }> = {
  pending: { label: '待接单', type: 'pending' },
  accepted: { label: '已接单', type: 'accepted' },
  picked_up: { label: '已取件', type: 'pickedUp' },
  delivered: { label: '已送达', type: 'delivered' },
  completed: { label: '已完成', type: 'completed' },
  exception: { label: '异常', type: 'exception' },
};

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <View className={classnames(styles.tag, styles[config.type])}>
      <Text className={styles.tagText}>{config.label}</Text>
    </View>
  );
};

export default StatusTag;
