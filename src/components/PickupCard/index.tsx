import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import { usePickupStore } from '@/store/usePickupStore';
import { PickupRecord } from '@/types';
import { getWeekDay, isToday, isTomorrow, isPast } from '@/utils/dateUtils';

interface PickupCardProps {
  record: PickupRecord;
  showDate?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const PickupCard: React.FC<PickupCardProps> = ({ record, showDate = false, compact = false, onClick }) => {
  const { getChildById, getSchoolById, getMemberById } = usePickupStore();

  const child = getChildById(record.childId);
  const school = getSchoolById(record.schoolId);
  const assignedMember = getMemberById(record.assignedTo);
  const swapToMember = record.swapTo ? getMemberById(record.swapTo) : null;
  const swapFromMember = record.swapFrom ? getMemberById(record.swapFrom) : null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/pickup-detail/index?id=${record.id}`,
      });
    }
  };

  const getStatusText = () => {
    if (record.status === 'picked') return '已接到';
    if (record.status === 'late') return '已迟到';
    if (record.swapStatus === 'requested') return '换班申请中';
    if (record.swapStatus === 'confirmed') return '已换班';
    return '待接送';
  };

  const getStatusType = () => {
    if (record.status === 'picked') return 'picked';
    if (record.status === 'late') return 'late';
    if (record.swapStatus === 'requested') return 'requested';
    if (record.swapStatus === 'confirmed') return 'confirmed';
    return 'pending';
  };

  const hasRisk = () => {
    if (record.status === 'late') return true;
    if (record.swapStatus === 'requested') return true;
    return false;
  };

  const dateLabel = () => {
    if (isToday(record.date)) return '今天';
    if (isTomorrow(record.date)) return '明天';
    return getWeekDay(record.date);
  };

  return (
    <View
      className={classnames(styles.card, {
        [styles.compact]: compact,
        [styles.risk]: hasRisk(),
        [styles.past]: isPast(record.date) && record.status === 'pending',
      })}
      onClick={handleClick}
    >
      {showDate && (
        <View className={styles.dateBar}>
          <Text className={styles.dateText}>{dateLabel()}</Text>
          <Text className={styles.dateFull}>{record.date}</Text>
        </View>
      )}

      <View className={styles.content}>
        <View className={styles.header}>
          <View className={styles.childInfo}>
            <Text className={styles.childName}>{child?.name}</Text>
            <StatusBadge type={getStatusType() as any} text={getStatusText()} size="sm" />
          </View>
          <Text className={styles.time}>{school?.dismissTime}</Text>
        </View>

        <View className={styles.schoolInfo}>
          <Text className={styles.schoolName}>{school?.name}</Text>
          {school?.className && (
            <Text className={styles.className}>{school.className}</Text>
          )}
        </View>

        <View className={styles.pickupInfo}>
          <View className={styles.memberRow}>
            {assignedMember && (
              <View className={styles.memberItem}>
                <Avatar name={assignedMember.name} color={assignedMember.color} size="sm" />
                <View className={styles.memberText}>
                  <Text className={styles.memberName}>{assignedMember.name}</Text>
                  <Text className={styles.memberRole}>{assignedMember.role}</Text>
                </View>
              </View>
            )}

            {record.swapStatus !== 'none' && swapToMember && (
              <View className={styles.swapArrow}>
                <Text className={styles.swapIcon}>→</Text>
              </View>
            )}

            {record.swapStatus !== 'none' && swapToMember && (
              <View className={styles.memberItem}>
                <Avatar name={swapToMember.name} color={swapToMember.color} size="sm" />
                <View className={styles.memberText}>
                  <Text className={styles.memberName}>{swapToMember.name}</Text>
                  <Text className={styles.memberRole}>{swapToMember.role}</Text>
                </View>
              </View>
            )}
          </View>

          {record.status === 'picked' && record.pickedTime && (
            <View className={styles.pickedInfo}>
              <Text className={styles.pickedLabel}>接到时间</Text>
              <Text className={styles.pickedTime}>{record.pickedTime}</Text>
            </View>
          )}

          {record.status === 'late' && record.lateMinutes && (
            <View className={styles.lateInfo}>
              <Text className={styles.lateLabel}>迟到</Text>
              <Text className={styles.lateMinutes}>{record.lateMinutes}分钟</Text>
            </View>
          )}
        </View>

        {record.remark && (
          <View className={styles.remark}>
            <Text className={styles.remarkText}>{record.remark}</Text>
          </View>
        )}

        {record.swapStatus === 'requested' && swapFromMember && swapToMember && (
          <View className={styles.swapNotice}>
            <Text className={styles.swapNoticeText}>
              {swapFromMember.name}申请换班给{swapToMember.name}，待确认
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PickupCard;
