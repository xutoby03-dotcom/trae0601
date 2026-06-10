import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { usePickupStore } from '@/store/usePickupStore';
import PickupCard from '@/components/PickupCard';
import SectionHeader from '@/components/SectionHeader';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import { generateWeekDates, getWeekDay, isToday, isTomorrow, isPast, formatDate } from '@/utils/dateUtils';

const SchedulePage: React.FC = () => {
  const { getWeekRecords, familyMembers, currentUserId, confirmSwap, rejectSwap, claimPickup } = usePickupStore();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const baseDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + currentWeekOffset * 7);
    return formatDate(date);
  }, [currentWeekOffset]);

  const weekDates = generateWeekDates(baseDate);
  const weekRecords = getWeekRecords();

  const weekData = useMemo(() => {
    return weekDates.map((date) => {
      const dayRecords = weekRecords.filter((r) => r.date === date);
      const pendingSwapRequests = dayRecords.filter((r) => r.swapStatus === 'requested');
      return {
        date,
        weekday: getWeekDay(date),
        records: dayRecords,
        swapRequestCount: pendingSwapRequests.length,
      };
    });
  }, [weekDates, weekRecords]);

  const handlePrevWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
  };

  const handleConfirmSwap = (recordId: string) => {
    confirmSwap(recordId);
    Taro.showToast({ title: '已确认换班', icon: 'success' });
  };

  const handleRejectSwap = (recordId: string) => {
    rejectSwap(recordId);
    Taro.showToast({ title: '已拒绝', icon: 'none' });
  };

  const handleRequestSwap = (recordId: string) => {
    Taro.navigateTo({
      url: `/pages/swap-request/index?id=${recordId}`,
    });
  };

  const handleClaim = (recordId: string) => {
    Taro.showModal({
      title: '确认认领',
      content: '确认认领此接送任务？',
      success: (res) => {
        if (res.confirm) {
          claimPickup(recordId, currentUserId);
          Taro.showToast({ title: '认领成功', icon: 'success' });
        }
      },
    });
  };

  const pendingSwapCount = useMemo(() => {
    return weekRecords.filter(
      (r) => r.swapStatus === 'requested' && r.swapTo === currentUserId
    ).length;
  }, [weekRecords, currentUserId]);

  return (
    <View className={styles.page}>
      <View className={styles.weekNav}>
        <View className={styles.navButton} onClick={handlePrevWeek}>
          <Text className={styles.navArrow}>‹</Text>
        </View>
        <View className={styles.weekTitle}>
          <Text className={styles.weekText}>
            {weekDates[0].slice(5)} ~ {weekDates[6].slice(5)}
          </Text>
          {pendingSwapCount > 0 && (
            <StatusBadge type="requested" text={`${pendingSwapCount}个待确认`} size="sm" />
          )}
        </View>
        <View className={styles.navButton} onClick={handleNextWeek}>
          <Text className={styles.navArrow}>›</Text>
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        {weekData.map((day) => (
          <View key={day.date} className={styles.daySection}>
            <View className={styles.dayHeader}>
              <View className={styles.dayLeft}>
                <Text
                  className={classnames(styles.dayName, {
                    [styles.today]: isToday(day.date),
                    [styles.past]: isPast(day.date),
                  })}
                >
                  {isToday(day.date) ? '今天' : isTomorrow(day.date) ? '明天' : day.weekday}
                </Text>
                <Text className={styles.dayDate}>{day.date.slice(5)}</Text>
              </View>
              <View className={styles.dayRight}>
                  <Text className={styles.recordCount}>{day.records.length}次接送</Text>
                  {day.swapRequestCount > 0 && (
                    <View className={styles.swapBadge}>
                      <Text className={styles.swapBadgeText}>{day.swapRequestCount}</Text>
                    </View>
                  )}
                </View>
              </View>

            {day.records.length > 0 ? (
              <View className={styles.cardList}>
                {day.records.map((record) => (
                <View key={record.id} className={styles.recordWrapper}>
                  <PickupCard record={record} compact />

                  {record.swapStatus === 'requested' && record.swapTo === currentUserId && (
                    <View className={styles.swapActions}>
                      <View className={styles.swapBtn} onClick={() => handleRejectSwap(record.id)}>
                        <Text className={styles.swapBtnText}>拒绝</Text>
                      </View>
                      <View
                        className={classnames(styles.swapBtn, styles.primary)}
                        onClick={() => handleConfirmSwap(record.id)}
                      >
                        <Text className={styles.swapBtnTextPrimary}>确认换班</Text>
                      </View>
                    </View>
                  )}

                  {record.swapStatus === 'none' && !isPast(day.date) && (
                    <View className={styles.actions}>
                      {record.assignedTo !== currentUserId && (
                        <View
                          className={classnames(styles.actionBtn, styles.claimBtn)}
                          onClick={() => handleClaim(record.id)}
                        >
                          <Text className={styles.claimBtnText}>认领</Text>
                        </View>
                      )}
                      <View className={styles.actionBtn} onClick={() => handleRequestSwap(record.id)}>
                        <Text className={styles.actionBtnText}>申请换班</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
              </View>
            ) : (
              <View className={styles.emptyDay}>
                <Text className={styles.emptyDayText}>无安排</Text>
              </View>
            )}
          </View>
        ))}

        <View className={styles.familySection}>
          <SectionHeader title="家庭成员" subtitle={`${familyMembers.length}人`} />
          <View className={styles.memberList}>
            {familyMembers.map((member) => (
              <View key={member.id} className={styles.memberItem}>
                <Avatar name={member.name} color={member.color} size="md" />
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>{member.name}</Text>
                  <Text className={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SchedulePage;
