import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subLabel?: string;
  subValue?: string | number;
  tone?: StatTone;
  icon?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  className?: string;
}

const toneMap: Record<StatTone, string> = {
  primary: 'tonePrimary',
  success: 'toneSuccess',
  warning: 'toneWarning',
  danger: 'toneDanger',
  info: 'toneInfo'
};

const StatCard: React.FC<StatCardProps> = ({
  label, value, unit, subLabel, subValue,
  tone = 'primary', icon, trend, trendValue, className
}) => {
  return (
    <View className={classnames(styles.card, styles[toneMap[tone]], className)}>
      {icon && (
        <View className={styles.iconWrap}>
          <Text className={styles.icon}>{icon}</Text>
        </View>
      )}
      <View className={styles.main}>
        <View className={styles.labelRow}>
          <Text className={styles.label}>{label}</Text>
          {trend && (
            <View className={classnames(styles.trend, styles[trend])}>
              <Text className={styles.trendText}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </Text>
            </View>
          )}
        </View>
        <View className={styles.valueRow}>
          <Text className={styles.value}>{value}</Text>
          {unit && <Text className={styles.unit}>{unit}</Text>}
        </View>
        {(subLabel || subValue !== undefined) && (
          <View className={styles.subRow}>
            {subLabel && <Text className={styles.subLabel}>{subLabel}</Text>}
            {subValue !== undefined && <Text className={styles.subValue}>{subValue}</Text>}
          </View>
        )}
      </View>
    </View>
  );
};

export default StatCard;
