import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { BoardGroupType } from '@/types';
import { GROUP_LABEL_MAP } from '@/types';

interface StatusGroupCardProps {
  type: BoardGroupType;
  count: number;
  active?: boolean;
  onClick?: () => void;
}

const configMap: Record<BoardGroupType, { icon: string; tone: string; desc: string }> = {
  normal:  { icon: '✅', tone: 'normal',  desc: '一切正常' },
  backlog: { icon: '📦', tone: 'backlog', desc: '后厨紧张' },
  noRider: { icon: '🏍️', tone: 'noRider', desc: '骑手紧缺' },
  lowStock:{ icon: '📉', tone: 'lowStock',desc: '库存告急' }
};

const StatusGroupCard: React.FC<StatusGroupCardProps> = ({ type, count, active, onClick }) => {
  const cfg = configMap[type];
  return (
    <View
      className={classnames(
        styles.card,
        styles[cfg.tone],
        active && styles.active
      )}
      onClick={() => {
        onClick?.();
        Taro.vibrateShort && Taro.vibrateShort({ type: 'light' });
      }}
    >
      <View className={styles.iconBox}>
        <Text className={styles.icon}>{cfg.icon}</Text>
      </View>
      <View className={styles.info}>
        <Text className={styles.label}>{GROUP_LABEL_MAP[type]}</Text>
        <Text className={styles.desc}>{cfg.desc}</Text>
      </View>
      <View className={styles.countBox}>
        <Text className={styles.count}>{count}</Text>
        <Text className={styles.countUnit}>单</Text>
      </View>
    </View>
  );
};

export default StatusGroupCard;
