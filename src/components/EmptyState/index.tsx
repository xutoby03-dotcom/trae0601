import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  message: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, description }) => {
  return (
    <View className={styles.container}>
      <Text className={styles.icon}>📭</Text>
      <Text className={styles.message}>{message}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </View>
  );
};

export default EmptyState;
