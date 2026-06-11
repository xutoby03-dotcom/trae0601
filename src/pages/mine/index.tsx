import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  return (
    <View className={styles.container}>
      <Text className={styles.icon}>👤</Text>
      <Text className={styles.title}>我的</Text>
      <Text className={styles.subtitle}>功能正在开发中...</Text>
    </View>
  );
};

export default MinePage;
