import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import { getWeekDay, isToday, isTomorrow } from '@/utils/dateUtils';
import classnames from 'classnames';

const PickupDetailPage: React.FC = () => {
  const router = useRouter();
  const {
    getChildById,
    getSchoolById,
    getMemberById,
    pickupRecords,
    markPicked,
    markLate,
    requestSwap,
    confirmSwap,
    rejectSwap,
    currentUserId,
  } = usePickupStore();

  const recordId = router.params?.id;
  const record = pickupRecords.find((r) => r.id === recordId);

  const [remark, setRemark] = useState('');
  const [showRemarkInput, setShowRemarkInput] = useState(false);

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
  const assignedMember = getMemberById(record.assignedTo);
  const swapFromMember = record.swapFrom ? getMemberById(record.swapFrom) : null;
  const swapToMember = record.swapTo ? getMemberById(record.swapTo) : null;

  const dateLabel = isToday(record.date)
    ? '今天'
    : isTomorrow(record.date)
    ? '明天'
    : getWeekDay(record.date);

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

  const handleMarkPicked = () => {
    Taro.showModal({
      title: '确认接到孩子',
      content: '确认已经接到孩子了吗？',
      success: (res) => {
        if (res.confirm) {
          markPicked(record.id, remark || record.remark);
          Taro.showToast({ title: '打卡成功', icon: 'success' });
        }
      },
    });
  };

  const handleRequestSwap = () => {
    Taro.navigateTo({
      url: `/pages/swap-request/index?id=${record.id}`,
    });
  };

  const handleConfirmSwap = () => {
    confirmSwap(record.id);
    Taro.showToast({ title: '已确认换班', icon: 'success' });
  };

  const handleRejectSwap = () => {
    rejectSwap(record.id);
    Taro.showToast({ title: '已拒绝', icon: 'none' });
  };

  const handleCallTeacher = () => {
    if (school?.teacherPhone) {
      Taro.makePhoneCall({ phoneNumber: school.teacherPhone });
    }
  };

  const handleCallMember = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone });
  };

  const canPick = record.status === 'pending' && record.assignedTo === currentUserId;
  const isSwapToMe = record.swapStatus === 'requested' && record.swapTo === currentUserId;
  const canSwap = record.status === 'pending' && record.swapStatus === 'none';

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.dateInfo}>
          <Text className={styles.dateLabel}>{dateLabel}</Text>
          <Text className={styles.dateFull}>{record.date}</Text>
        </View>
        <StatusBadge type={getStatusType() as any} text={getStatusText()} size="md" />
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.childName}>{child?.name}</Text>
            <Text className={styles.dismissTime}>{school?.dismissTime} 放学</Text>
          </View>
          <View className={styles.schoolInfo}>
            <Text className={styles.schoolName}>{school?.name}</Text>
            {school?.className && (
              <Text className={styles.className}>{school.className}</Text>
            )}
          </View>
          <View className={styles.addressRow}>
            <Text className={styles.addressLabel}>📍</Text>
            <Text className={styles.addressText}>{school?.address}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>接送人</Text>
          {assignedMember && (
            <View className={styles.memberRow}>
              <Avatar name={assignedMember.name} color={assignedMember.color} size="md" />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>{assignedMember.name}</Text>
                <Text className={styles.memberRole}>{assignedMember.role}</Text>
              </View>
              <View
                className={styles.callBtn}
                onClick={() => handleCallMember(assignedMember.phone)}
              >
                <Text className={styles.callIcon}>📞</Text>
              </View>
            </View>
          )}

          {record.swapStatus !== 'none' && swapFromMember && swapToMember && (
            <View className={styles.swapInfo}>
              <View className={styles.swapRow}>
                <View className={styles.swapMember}>
                  <Avatar name={swapFromMember.name} color={swapFromMember.color} size="sm" />
                  <Text className={styles.swapMemberName}>{swapFromMember.name}</Text>
                </View>
                <Text className={styles.swapArrow}>→</Text>
                <View className={styles.swapMember}>
                  <Avatar name={swapToMember.name} color={swapToMember.color} size="sm" />
                  <Text className={styles.swapMemberName}>{swapToMember.name}</Text>
                </View>
              </View>
              <Text className={styles.swapStatusText}>
                {record.swapStatus === 'requested'
                  ? '换班申请中，待对方确认'
                  : '已确认换班'}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>老师信息</Text>
          <View className={styles.teacherRow}>
            <View className={styles.teacherInfo}>
              <Text className={styles.teacherName}>{school?.teacherName}</Text>
              <Text className={styles.teacherPhone}>{school?.teacherPhone}</Text>
            </View>
            <View className={styles.callBtn} onClick={handleCallTeacher}>
              <Text className={styles.callIcon}>📞</Text>
            </View>
          </View>
        </View>

        {record.remark && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>备注</Text>
            <Text className={styles.remarkText}>{record.remark}</Text>
          </View>
        )}

        {record.pickedTime && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>接到时间</Text>
            <Text className={styles.pickedTimeText}>{record.pickedTime}</Text>
            {record.isLate && record.lateMinutes && (
              <Text className={styles.lateText}>迟到 {record.lateMinutes} 分钟</Text>
            )}
          </View>
        )}
      </View>

      <View className={styles.footer}>
        {isSwapToMe && (
          <View className={styles.footerRow}>
            <View className={styles.rejectBtn} onClick={handleRejectSwap}>
              <Text className={styles.rejectBtnText}>拒绝</Text>
            </View>
            <View className={styles.confirmBtn} onClick={handleConfirmSwap}>
              <Text className={styles.confirmBtnText}>确认换班</Text>
            </View>
          </View>
        )}

        {canPick && (
          <View className={styles.footerRow}>
            <View className={styles.secondaryBtn} onClick={handleRequestSwap}>
              <Text className={styles.secondaryBtnText}>申请换班</Text>
            </View>
            <View className={styles.primaryBtn} onClick={handleMarkPicked}>
              <Text className={styles.primaryBtnText}>✓ 已接到孩子</Text>
            </View>
          </View>
        )}

        {canSwap && !canPick && (
          <View className={styles.footerBtn} onClick={handleRequestSwap}>
            <Text className={styles.footerBtnText}>申请换班</Text>
          </View>
        )}

        {record.status === 'picked' && !showRemarkInput && (
          <View
            className={styles.footerBtn}
            onClick={() => setShowRemarkInput(true)}
          >
            <Text className={styles.footerBtnText}>添加备注</Text>
          </View>
        )}
      </View>

      {showRemarkInput && (
        <View className={styles.remarkModal}>
          <View className={styles.remarkBox}>
            <Text className={styles.remarkTitle}>写一句备注</Text>
            <Input
              className={styles.remarkInput}
              placeholder="今天孩子表现怎么样..."
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
            <View className={styles.remarkActions}>
              <View
                className={styles.cancelBtn}
                onClick={() => setShowRemarkInput(false)}
              >
                <Text className={styles.cancelBtnText}>取消</Text>
              </View>
              <View
                className={styles.submitBtn}
                onClick={() => {
                  markPicked(record.id, remark);
                  setShowRemarkInput(false);
                  Taro.showToast({ title: '已保存', icon: 'success' });
                }}
              >
                <Text className={styles.submitBtnText}>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default PickupDetailPage;
