import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { WarningRecord } from '@/types';
import Tag from '@/components/Tag';

interface WarningBannerProps {
  warning: WarningRecord;
  onAcknowledge?: () => void;
}

const levelMap = {
  info: { icon: 'ℹ️', cls: 'levelInfo' },
  warning: { icon: '⚠️', cls: 'levelWarning' },
  danger: { icon: '🚨', cls: 'levelDanger' }
};

const WarningBanner: React.FC<WarningBannerProps> = ({ warning, onAcknowledge }) => {
  const lv = levelMap[warning.level];
  return (
    <View
      className={classnames(
        styles.banner,
        styles[lv.cls],
        warning.acknowledged && styles.acknowledged
      )}
      onClick={onAcknowledge}
    >
      <View className={styles.header}>
        <View className={styles.iconBox}>
          <Text className={styles.icon}>{lv.icon}</Text>
        </View>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{warning.title}</Text>
          <Tag
            text={warning.level === 'danger' ? '紧急' : warning.level === 'warning' ? '注意' : '提示'}
            color={warning.level === 'danger' ? 'danger' : warning.level === 'warning' ? 'warning' : 'info'}
            size="sm"
          />
        </View>
      </View>
      <View className={styles.body}>
        <Text className={styles.message}>{warning.message}</Text>
        <View className={styles.suggestionBox}>
          <Text className={styles.suggestionLabel}>💡 应对建议：</Text>
          <Text className={styles.suggestionText}>{warning.suggestion}</Text>
        </View>
      </View>
      {!warning.acknowledged && (
        <View className={styles.ackTip}>
          <Text className={styles.ackTipText}>点击卡片已阅</Text>
        </View>
      )}
    </View>
  );
};

export default WarningBanner;
