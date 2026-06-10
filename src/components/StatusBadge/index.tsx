import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { PickupStatus, SwapStatus } from '@/types';

interface StatusBadgeProps {
  type: PickupStatus | SwapStatus | 'default';
  text: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, text, size = 'md' }) => {
  return (
    <View className={classnames(styles.badge, styles[type], styles[size])}>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default StatusBadge;
