import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import Avatar from '@/components/Avatar';
import classnames from 'classnames';
import { getWeekDay, isToday, isTomorrow } from '@/utils/dateUtils';

const SwapRequestPage: React.FC = () => {
  const router = useRouter();
  const {
    pickupRecords,
    familyMembers,
    getChildById,
    getSchoolById,
    getMemberById,
    requestSwap,
    currentUserId,
  } = usePickupStore();

  const recordId = router.params?.id;
  const record = pickupRecords.find((r) => r.id === recordId);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [reason, setReason] = useState('');

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.emptyText}>未找到接送记录</Text>
        </View>
      </View>
    );
  }

  const child = getChildById(record.childId);
  const school = getSchoolById(record.schoolId);
  const currentMember = getMemberById(currentUserId);

  const dateLabel = isToday(record.date)
    ? '今天'
    : isTomorrow(record.date)
    ? '明天'
    : getWeekDay(record.date);

  const availableMembers = familyMembers.filter((m) => m.id !== record.assignedTo);

  const handleSubmit = () => {
    if (!selectedMemberId) {
      Taro.showToast({ title: '请选择换班对象', icon: 'none' });
      return;
    }

    requestSwap(record.id, record.assignedTo, selectedMemberId);
    Taro.showToast({ title: '申请已发送', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>换班信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>日期</Text>
            <Text className={styles.infoValue}>
              {dateLabel} {record.date}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>孩子</Text>
            <Text className={styles.infoValue}>{child?.name}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>学校</Text>
            <Text className={styles.infoValue}>{school?.name}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>放学时间</Text>
            <Text className={styles.infoValue}>{school?.dismissTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>当前接送人</Text>
            <View className={styles.currentPerson}>
              {currentMember && (
                <Avatar name={currentMember.name} color={currentMember.color} size="sm" />
              )}
              <Text className={styles.currentPersonName}>
                {currentMember?.name}（{currentMember?.role}）
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>选择换班给</Text>
          <Text className={styles.hint}>请选择要把这次接送任务换给谁</Text>
          <View className={styles.memberGrid}>
            {availableMembers.map((member) => (
              <View
                key={member.id}
                className={classnames(styles.memberItem, {
                  [styles.selected]: selectedMemberId === member.id,
                })}
                onClick={() => setSelectedMemberId(member.id)}
              >
                <Avatar name={member.name} color={member.color} size="md" />
                <Text className={styles.memberName}>{member.name}</Text>
                <Text className={styles.memberRole}>{member.role}</Text>
                {selectedMemberId === member.id && (
                  <View className={styles.checkMark}>
                    <Text className={styles.checkText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>换班原因（选填）</Text>
          <Input
            className={styles.reasonInput}
            placeholder="简单说明一下换班原因..."
            value={reason}
            onInput={(e) => setReason(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>发送换班申请</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SwapRequestPage;
