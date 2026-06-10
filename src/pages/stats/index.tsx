import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import SectionHeader from '@/components/SectionHeader';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';
import { getWeekDay } from '@/utils/dateUtils';

type StatsTab = 'pickup' | 'late' | 'swap';

const StatsPage: React.FC = () => {
  const { getStatsByMember, getSwapStats, familyMembers, pickupRecords } = usePickupStore();
  const [activeTab, setActiveTab] = useState<StatsTab>('pickup');

  const memberStats = useMemo(() => {
    return getStatsByMember()
      .map((stat) => {
        const member = familyMembers.find((m) => m.id === stat.memberId);
        return { ...stat, member };
      })
      .sort((a, b) => b.totalPickups - a.totalPickups);
  }, [getStatsByMember, familyMembers]);

  const lateStats = useMemo(() => {
    return [...memberStats].sort((a, b) => b.lateCount - a.lateCount);
  }, [memberStats]);

  const swapStats = useMemo(() => {
    return getSwapStats();
  }, [getSwapStats]);

  const totalStats = useMemo(() => {
    const totalPickups = memberStats.reduce((sum, s) => sum + s.totalPickups, 0);
    const totalLate = memberStats.reduce((sum, s) => sum + s.lateCount, 0);
    const totalSwapCount = pickupRecords.filter((r) => r.swapStatus === 'confirmed').length;
    const onTimeRate = totalPickups > 0 ? Math.round(((totalPickups - totalLate) / totalPickups) * 100) : 0;
    return { totalPickups, totalLate, totalSwapCount, onTimeRate };
  }, [memberStats, pickupRecords]);

  const maxPickups = Math.max(...memberStats.map((s) => s.totalPickups), 1);
  const maxLate = Math.max(...lateStats.map((s) => s.lateCount), 1);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>数据统计</Text>
        <Text className={styles.headerSubtitle}>查看接送情况和换班记录</Text>

        <View className={styles.overviewCards}>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.totalPickups}</Text>
            <Text className={styles.overviewLabel}>总接送次数</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.onTimeRate}%</Text>
            <Text className={styles.overviewLabel}>准时率</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.totalLate}</Text>
            <Text className={styles.overviewLabel}>迟到次数</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.totalSwapCount}</Text>
            <Text className={styles.overviewLabel}>换班次数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'pickup' })}
            onClick={() => setActiveTab('pickup')}
          >
            <Text className={styles.tabText}>接送排行</Text>
          </View>
          <View
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'late' })}
            onClick={() => setActiveTab('late')}
          >
            <Text className={styles.tabText}>迟到统计</Text>
          </View>
          <View
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'swap' })}
            onClick={() => setActiveTab('swap')}
          >
            <Text className={styles.tabText}>换班统计</Text>
          </View>
        </View>

        {activeTab === 'pickup' && (
          <View className={styles.section}>
            <SectionHeader title="接送次数排行" subtitle="按接送次数从多到少" />
            <View className={styles.rankList}>
              {memberStats.map((stat, index) => (
                <View key={stat.memberId} className={styles.rankItem}>
                  <View className={styles.rankLeft}>
                    <View
                      className={classnames(styles.rankNumber, {
                        [styles.rank1]: index === 0,
                        [styles.rank2]: index === 1,
                        [styles.rank3]: index === 2,
                      })}
                    >
                      <Text className={styles.rankNumText}>{index + 1}</Text>
                    </View>
                    {stat.member && (
                      <Avatar name={stat.member.name} color={stat.member.color} size="md" />
                    )}
                    <View className={styles.rankInfo}>
                      <Text className={styles.rankName}>{stat.member?.name}</Text>
                      <Text className={styles.rankRole}>{stat.member?.role}</Text>
                    </View>
                  </View>
                  <View className={styles.rankRight}>
                    <Text className={styles.rankCount}>{stat.totalPickups}次</Text>
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{ width: `${(stat.totalPickups / maxPickups) * 100}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'late' && (
          <View className={styles.section}>
            <SectionHeader title="迟到次数统计" subtitle="按迟到次数从多到少" />
            <View className={styles.rankList}>
              {lateStats.map((stat, index) => (
                <View key={stat.memberId} className={styles.rankItem}>
                  <View className={styles.rankLeft}>
                    <View
                      className={classnames(styles.rankNumber, {
                        [styles.rank1]: index === 0 && stat.lateCount > 0,
                        [styles.rank2]: index === 1 && stat.lateCount > 0,
                        [styles.rank3]: index === 2 && stat.lateCount > 0,
                      })}
                    >
                      <Text className={styles.rankNumText}>{index + 1}</Text>
                    </View>
                    {stat.member && (
                      <Avatar name={stat.member.name} color={stat.member.color} size="md" />
                    )}
                    <View className={styles.rankInfo}>
                      <Text className={styles.rankName}>{stat.member?.name}</Text>
                      <Text className={styles.rankRole}>{stat.member?.role}</Text>
                    </View>
                  </View>
                  <View className={styles.rankRight}>
                    <Text className={classnames(styles.rankCount, styles.lateCount)}>
                      {stat.lateCount}次
                    </Text>
                    <View className={styles.progressBar}>
                      <View
                        className={classnames(styles.progressFill, styles.lateFill)}
                        style={{ width: `${(stat.lateCount / maxLate) * 100}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'swap' && (
          <View className={styles.section}>
            <SectionHeader title="临时换班最多的日期" subtitle="按换班次数从多到少" />
            {swapStats.length > 0 ? (
              <View className={styles.swapList}>
                {swapStats.map((item, index) => (
                  <View key={item.date} className={styles.swapItem}>
                    <View className={styles.swapLeft}>
                      <View
                        className={classnames(styles.rankNumber, {
                          [styles.rank1]: index === 0,
                          [styles.rank2]: index === 1,
                          [styles.rank3]: index === 2,
                        })}
                      >
                        <Text className={styles.rankNumText}>{index + 1}</Text>
                      </View>
                      <View className={styles.swapDateInfo}>
                        <Text className={styles.swapDate}>{item.date}</Text>
                        <Text className={styles.swapWeekday}>{getWeekDay(item.date)}</Text>
                      </View>
                    </View>
                    <StatusBadge type="confirmed" text={`${item.count}次换班`} size="md" />
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无换班记录</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default StatsPage;
