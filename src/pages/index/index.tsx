import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import PickupCard from '@/components/PickupCard';
import SectionHeader from '@/components/SectionHeader';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import { getWeekDay, generateWeekDates, isTomorrow } from '@/utils/dateUtils';

const IndexPage: React.FC = () => {
  const { getTodayRecords, getWeekRecords, getMemberById, currentUserId, children, schools } = usePickupStore();

  const todayRecords = getTodayRecords();
  const tomorrowRecords = getWeekRecords().filter((r) => isTomorrow(r.date));
  const weekRecords = getWeekRecords();

  const currentUser = getMemberById(currentUserId);

  const todaySummary = useMemo(() => {
    const total = todayRecords.length;
    const pending = todayRecords.filter((r) => r.status === 'pending').length;
    const picked = todayRecords.filter((r) => r.status === 'picked').length;
    const late = todayRecords.filter((r) => r.status === 'late').length;
    const swapRequested = todayRecords.filter((r) => r.swapStatus === 'requested').length;
    return { total, pending, picked, late, swapRequested };
  }, [todayRecords]);

  const weekDates = generateWeekDates();

  const weekSummary = useMemo(() => {
    return weekDates.map((date) => {
      const dayRecords = weekRecords.filter((r) => r.date === date);
      return {
        date,
        weekday: getWeekDay(date),
        count: dayRecords.length,
        hasRisk: dayRecords.some((r) => r.status === 'late' || r.swapStatus === 'requested'),
      };
    });
  }, [weekDates, weekRecords]);

  const handleAddChild = () => {
    Taro.navigateTo({ url: '/pages/child-edit/index' });
  };

  const handleGoSchedule = () => {
    Taro.switchTab({ url: '/pages/schedule/index' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.greeting}>你好，{currentUser?.name}</Text>
            <Text className={styles.dateText}>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</Text>
          </View>
          {currentUser && (
            <Avatar name={currentUser.name} color={currentUser.color} size="md" />
          )}
        </View>

        <View className={styles.statsBar}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{todaySummary.total}</Text>
            <Text className={styles.statLabel}>今日接送</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{todaySummary.picked}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{todaySummary.pending}</Text>
            <Text className={styles.statLabel}>待接送</Text>
          </View>
          <View className={styles.statItem}>
            {todaySummary.swapRequested > 0 ? (
              <StatusBadge type="requested" text={`${todaySummary.swapRequested}待确认`} size="md" />
            ) : (
              <>
                <Text className={styles.statNumber}>0</Text>
                <Text className={styles.statLabel}>待确认</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <SectionHeader title="今日接送" subtitle={`${todayRecords.length}个任务`} />
          {todayRecords.length > 0 ? (
            <View className={styles.cardList}>
              {todayRecords.map((record) => (
                <PickupCard key={record.id} record={record} />
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>今日暂无接送安排</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <SectionHeader title="明日接送" subtitle={`${tomorrowRecords.length}个任务`} />
          {tomorrowRecords.length > 0 ? (
            <View className={styles.cardList}>
              {tomorrowRecords.map((record) => (
                <PickupCard key={record.id} record={record} compact />
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>明日暂无接送安排</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <SectionHeader title="本周概览" extra={
            <Text className={styles.moreLink} onClick={handleGoSchedule}>查看全部 →</Text>
          } />
          <View className={styles.weekGrid}>
            {weekSummary.map((day) => (
              <View
                key={day.date}
                className={styles.weekDayCard}
                onClick={handleGoSchedule}
              >
                <Text className={styles.weekday}>{day.weekday}</Text>
                <Text className={styles.dayCount}>{day.count > 0 ? `${day.count}次` : '休息'}</Text>
                {day.hasRisk && <View className={styles.riskDot} />}
              </View>
            ))}
          </View>
        </View>

        {(children.length === 0 || schools.length === 0) && (
          <View className={styles.section}>
            <View className={styles.setupCard} onClick={handleAddChild}>
              <Text className={styles.setupTitle}>添加孩子信息</Text>
              <Text className={styles.setupDesc}>完善孩子和学校信息，开始使用接送排班</Text>
              <View className={styles.setupButton}>
                <Text className={styles.setupButtonText}>去添加</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default IndexPage;
