import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import { usePickupStore } from '@/store/pickupStore';
import { currentUser, mockUsers } from '@/data/users';
import styles from './index.module.scss';

const HELPED_STATUSES = ['accepted', 'picked_up', 'delivered', 'completed', 'exception', 'exception_resolved'] as const;

const StatsPage: React.FC = () => {
  const { requests, isExpiring } = usePickupStore();

  const userMap = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string; building: string }>();
    mockUsers.forEach((u) => {
      map.set(u.id, { name: u.name, avatar: u.avatar, building: u.building });
    });
    return map;
  }, []);

  const helperRankings = useMemo(() => {
    const helpMap = new Map<string, { helpCount: number; totalReward: number }>();

    requests.forEach((r) => {
      if (!r.acceptedBy || !HELPED_STATUSES.includes(r.status as typeof HELPED_STATUSES[number])) return;
      const prev = helpMap.get(r.acceptedBy) || { helpCount: 0, totalReward: 0 };
      helpMap.set(r.acceptedBy, {
        helpCount: prev.helpCount + 1,
        totalReward: prev.totalReward + r.reward,
      });
    });

    return Array.from(helpMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: userMap.get(userId)?.name || '邻居',
        avatar: userMap.get(userId)?.avatar || '',
        building: userMap.get(userId)?.building || '',
        helpCount: data.helpCount,
        totalReward: data.totalReward,
      }))
      .sort((a, b) => b.helpCount - a.helpCount || b.totalReward - a.totalReward);
  }, [requests, userMap]);

  const myHelpCount = useMemo(
    () => helperRankings.find((h) => h.userId === currentUser.id)?.helpCount || 0,
    [helperRankings]
  );

  const myTotalReward = useMemo(
    () => helperRankings.find((h) => h.userId === currentUser.id)?.totalReward || 0,
    [helperRankings]
  );

  const myRankIndex = useMemo(
    () => helperRankings.findIndex((h) => h.userId === currentUser.id),
    [helperRankings]
  );

  const totalHelped = useMemo(
    () => requests.filter((r) => ['delivered', 'completed', 'exception', 'exception_resolved'].includes(r.status)).length,
    [requests]
  );

  const totalPublished = useMemo(
    () => requests.filter((r) => r.publisherId === currentUser.id).length,
    [requests]
  );

  const lockerRankings = useMemo(() => {
    const lockerMap = new Map<string, { total: number; expiring: number }>();

    requests.forEach((r) => {
      const prev = lockerMap.get(r.lockerLocation) || { total: 0, expiring: 0 };
      prev.total += 1;
      if (isExpiring(r.deadline)) {
        prev.expiring += 1;
      }
      lockerMap.set(r.lockerLocation, prev);
    });

    return Array.from(lockerMap.entries())
      .map(([lockerLocation, data]) => ({
        lockerLocation,
        totalRequests: data.total,
        timeoutCount: data.expiring,
        timeoutRate: data.total > 0 ? Math.round((data.expiring / data.total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.timeoutRate - a.timeoutRate);
  }, [requests, isExpiring]);

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
          <Text className={styles.statNum}>¥{myTotalReward}</Text>
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
              帮忙{myHelpCount}次 · {currentUser.building}
            </Text>
          </View>
          <View className={styles.myStatRank}>
            <Text className={styles.myRankNum}>{myRankIndex >= 0 ? `第${myRankIndex + 1}名` : '暂无排名'}</Text>
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
          {lockerRankings.map((locker) => (
            <View key={locker.lockerLocation} className={styles.lockerItem}>
              <View className={styles.lockerInfo}>
                <Text className={styles.lockerName}>{locker.lockerLocation}</Text>
                <Text className={styles.lockerDetail}>
                  共{locker.totalRequests}件 · 快超时{locker.timeoutCount}件
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
