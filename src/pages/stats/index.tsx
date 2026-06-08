import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { usePickupStore } from '@/store/pickupStore';
import { helperRankings, lockerStats } from '@/data/stats';
import { currentUser } from '@/data/users';
import styles from './index.module.scss';

const StatsPage: React.FC = () => {
  const { requests } = usePickupStore();

  const totalHelped = useMemo(
    () => requests.filter((r) => ['delivered', 'completed'].includes(r.status)).length,
    [requests]
  );
  const totalPublished = useMemo(
    () => requests.filter((r) => r.publisherId === currentUser.id).length,
    [requests]
  );
  const totalReward = useMemo(
    () =>
      requests
        .filter((r) => r.acceptedBy === currentUser.id && ['delivered', 'completed'].includes(r.status))
        .reduce((sum, r) => sum + r.reward, 0),
    [requests]
  );

  const myRankIndex = useMemo(
    () => helperRankings.findIndex((h) => h.userId === currentUser.id),
    [helperRankings]
  );

  const getIndexClass = (index: number) => {
    if (index === 0) return styles.rankFirst;
    if (index === 1) return styles.rankSecond;
    if (index === 2) return styles.rankThird;
    return '';
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📊 社区统计</Text>
        <Text className={styles.headerSubtitle}>邻里互助，共建温暖社区</Text>
      </View>

      <View className={styles.statsSummary}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{totalHelped}</Text>
          <Text className={styles.statLabel}>累计帮忙</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{totalPublished}</Text>
          <Text className={styles.statLabel}>发布需求</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>¥{totalReward}</Text>
          <Text className={styles.statLabel}>获得红包</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>🏆</Text>
          <Text className={styles.sectionTitle}>帮忙排行榜</Text>
        </View>

        <View className={styles.myStatCard}>
          <Image className={styles.myStatAvatar} src={currentUser.avatar} mode="aspectFill" />
          <View className={styles.myStatInfo}>
            <Text className={styles.myStatName}>{currentUser.name}</Text>
            <Text className={styles.myStatDetail}>
              帮忙{currentUser.helpCount}次 · {currentUser.building}
            </Text>
          </View>
          <View className={styles.myStatRank}>
            <Text className={styles.myRankNum}>第{myRankIndex + 1}名</Text>
            <Text className={styles.myRankLabel}>我的排名</Text>
          </View>
        </View>

        <View className={styles.rankList}>
          {helperRankings.map((helper, index) => (
            <View key={helper.userId} className={styles.rankItem}>
              <View className={classnames(styles.rankIndex, getIndexClass(index))}>
                <Text style={{ fontSize: '22rpx', fontWeight: 600, color: '#fff' }}>{index + 1}</Text>
              </View>
              <Image className={styles.rankAvatar} src={helper.avatar} mode="aspectFill" />
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{helper.name}</Text>
                <Text className={styles.rankBuilding}>{helper.building}</Text>
              </View>
              <View className={styles.rankStats}>
                <Text className={styles.rankHelpCount}>{helper.helpCount}次</Text>
                <Text className={styles.rankHelpLabel}>帮忙次数</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>⏰</Text>
          <Text className={styles.sectionTitle}>快递柜超时排行</Text>
        </View>

        <View className={styles.rankList}>
          {lockerStats
            .sort((a, b) => b.timeoutRate - a.timeoutRate)
            .map((locker) => (
              <View key={locker.lockerLocation} className={styles.lockerItem}>
                <View className={styles.lockerInfo}>
                  <Text className={styles.lockerName}>{locker.lockerLocation}</Text>
                  <Text className={styles.lockerDetail}>
                    共{locker.totalRequests}件 · 超时{locker.timeoutCount}件
                  </Text>
                  <View className={styles.progressBar}>
                    <View
                      className={styles.progressFill}
                      style={{ width: `${Math.min(locker.timeoutRate * 4, 100)}%` }}
                    />
                  </View>
                </View>
                <View className={styles.lockerRate}>
                  <Text className={styles.lockerRateNum}>{locker.timeoutRate}%</Text>
                  <Text className={styles.lockerRateLabel}>超时率</Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
};

export default StatsPage;
