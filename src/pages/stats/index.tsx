import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useFoodStore } from '@/store/foodStore';
import { formatDateCN } from '@/utils/date';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const StatsPage: React.FC = () => {
  const getStats = useFoodStore(state => state.getStats);
  const stats = useMemo(() => getStats(), [getStats]);

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const getWeekday = (dateStr: string) => {
    const date = dayjs(dateStr);
    return weekdays[date.day()];
  };

  const maxCount = useMemo(() => {
    if (stats.mostLeftoverDay.length === 0) return 1;
    return Math.max(...stats.mostLeftoverDay.map(d => d.count));
  }, [stats.mostLeftoverDay]);

  const hasData = stats.totalCount > 0;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>📊 数据统计</Text>
        <Text className={styles.pageSubtitle}>了解你的剩菜管理情况</Text>
      </View>

      <ScrollView scrollY className={styles.content}>
        {hasData ? (
          <>
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>总体概览</Text>
              <View className={styles.overviewGrid}>
                <View className={styles.overviewCard} style={{ borderTopColor: '#FF7A45' }}>
                  <Text className={styles.overviewIcon}>📝</Text>
                  <View className={styles.overviewInfo}>
                    <Text className={styles.overviewValue} style={{ color: '#FF7A45' }}>{stats.totalCount}</Text>
                    <Text className={styles.overviewLabel}>总记录</Text>
                  </View>
                </View>
                <View className={styles.overviewCard} style={{ borderTopColor: '#4CAF50' }}>
                  <Text className={styles.overviewIcon}>🍽️</Text>
                  <View className={styles.overviewInfo}>
                    <Text className={styles.overviewValue} style={{ color: '#4CAF50' }}>{stats.eatenCount}</Text>
                    <Text className={styles.overviewLabel}>已吃掉</Text>
                  </View>
                </View>
                <View className={styles.overviewCard} style={{ borderTopColor: '#F44336' }}>
                  <Text className={styles.overviewIcon}>🗑️</Text>
                  <View className={styles.overviewInfo}>
                    <Text className={styles.overviewValue} style={{ color: '#F44336' }}>{stats.discardedCount}</Text>
                    <Text className={styles.overviewLabel}>已倒掉</Text>
                  </View>
                </View>
                <View className={styles.overviewCard} style={{ borderTopColor: '#9C27B0' }}>
                  <Text className={styles.overviewIcon}>✨</Text>
                  <View className={styles.overviewInfo}>
                    <Text className={styles.overviewValue} style={{ color: '#9C27B0' }}>{stats.transformedCount}</Text>
                    <Text className={styles.overviewLabel}>已改造</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>平均保存天数</Text>
              <View className={styles.avgCard}>
                <View className={styles.avgContent}>
                  <Text className={styles.avgLabel}>每份剩菜平均保存</Text>
                  <Text className={styles.avgValue}>
                    {stats.avgStorageDays}
                    <Text className={styles.unit}>天</Text>
                  </Text>
                </View>
                <Text className={styles.avgIcon}>📅</Text>
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>浪费排行榜</Text>
              {stats.mostWasted.length > 0 ? (
                <View className={styles.rankList}>
                  {stats.mostWasted.map((item, index) => (
                    <View key={item.name} className={styles.rankItem}>
                      <View
                        className={`${styles.rankNumber} ${
                          index === 0 ? styles.rank1 :
                          index === 1 ? styles.rank2 :
                          index === 2 ? styles.rank3 : styles.rankOther
                        }`}
                      >
                        {index === 0 && <Text className={styles.rankCrown}>👑</Text>}
                        {index + 1}
                      </View>
                      <Text className={styles.rankName}>{item.name}</Text>
                      <View className={styles.rankCount}>
                        {item.count}
                        <Text className={styles.times}>次</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyIcon}>🎉</Text>
                  <Text className={styles.emptyText}>太棒了！</Text>
                  <Text className={styles.emptySubtext}>暂时没有浪费记录</Text>
                </View>
              )}
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>哪天剩菜最多</Text>
              {stats.mostLeftoverDay.length > 0 ? (
                <View className={styles.dateList}>
                  {stats.mostLeftoverDay.map((item, index) => (
                    <View key={item.date} className={styles.dateItem}>
                      <View className={styles.dateInfo}>
                        <Text className={styles.dateText}>{formatDateCN(item.date)}</Text>
                        <Text className={styles.dateWeekday}>{getWeekday(item.date)}</Text>
                      </View>
                      <View className={styles.dateBarContainer}>
                        <View
                          className={styles.dateBar}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </View>
                      <View className={styles.dateCount}>
                        {item.count}
                        <Text className={styles.unit}>份</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyIcon}>📊</Text>
                  <Text className={styles.emptyText}>暂无数据</Text>
                  <Text className={styles.emptySubtext}>记录一些剩菜后再来看看</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🍽️</Text>
            <Text className={styles.emptyText}>还没有记录</Text>
            <Text className={styles.emptySubtext}>快去添加第一份剩菜吧</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default StatsPage;
