import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { FoodStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/food';
import styles from './index.module.scss';

interface StatusBadgeProps {
  status: FoodStatus;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <View
      className={classnames(styles.badge, styles[size])}
      style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
    >
      <Text className={styles.dot} style={{ backgroundColor: color }}></Text>
      <Text className={styles.text} style={{ color }}>{label}</Text>
    </View>
  );
};

export default StatusBadge;
