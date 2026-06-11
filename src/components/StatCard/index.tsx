import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = '#FF7A45',
  icon
}) => {
  return (
    <View className={styles.card} style={{ borderTopColor: color }}>
      {icon && <Text className={styles.icon}>{icon}</Text>}
      <View className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.value} style={{ color }}>{value}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

export default StatCard;
