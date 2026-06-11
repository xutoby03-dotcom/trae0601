import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { FoodStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/food';
import styles from './index.module.scss';

interface GroupSectionProps {
  status: FoodStatus;
  count: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  status,
  count,
  children,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <View className={styles.section}>
      <View
        className={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <View className={styles.titleRow}>
          <View
            className={styles.colorBar}
            style={{ backgroundColor: color }}
          />
          <Text className={styles.title} style={{ color }}>{label}</Text>
          <View className={styles.countBadge}>
            <Text className={styles.countText}>{count}</Text>
          </View>
        </View>
        <Text
          className={classnames(styles.arrow, expanded && styles.expanded)}
          style={{ color }}
        >
          ▾
        </Text>
      </View>
      {expanded && (
        <View className={styles.content}>
          {count > 0 ? (
            children
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无记录</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default GroupSection;
