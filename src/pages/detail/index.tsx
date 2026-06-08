import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { usePickupStore } from '@/store/pickupStore';
import { currentUser } from '@/data/users';
import styles from './index.module.scss';

const sizeLabels: Record<string, string> = { small: '小件', medium: '中件', large: '重件' };
const exceptionLabels: Record<string, string> = {
  code_invalid: '取件码失效',
  door_stuck: '柜门打不开',
  package_damaged: '包裹破损',
  other: '其他异常',
};
const statusEmoji: Record<string, string> = {
  pending: '📢',
  accepted: '🤝',
  picked_up: '📦',
  delivered: '✅',
  completed: '🎉',
  exception: '⚠️',
};
const statusText: Record<string, string> = {
  pending: '等待邻居帮忙',
  accepted: '已有人接单',
  picked_up: '快递已取出',
  delivered: '快递已送达',
  completed: '任务完成',
  exception: '出现异常',
};

const DetailPage: React.FC = () => {
  const router = useRouter();
  const { getRequestById, acceptRequest, markPickedUp, markDelivered, isExpiring } = usePickupStore();

  const request = useMemo(() => {
    const id = router.params.id || '';
    return getRequestById(id);
  }, [router.params.id]);

  if (!request) {
    return (
      <View className={styles.container}>
        <Text>请求不存在或已过期</Text>
      </View>
    );
  }

  const isMyOrder = request.acceptedBy === currentUser.id;
  const canAccept = request.status === 'pending';
  const canPickUp = request.status === 'accepted' && isMyOrder;
  const canDeliver = request.status === 'picked_up' && isMyOrder;
  const canReportException = ['accepted', 'picked_up'].includes(request.status) && isMyOrder;

  const showCode = isMyOrder && ['accepted', 'picked_up'].includes(request.status);
  const codeCompleted = ['delivered', 'completed'].includes(request.status);

  const getStepConfig = () => {
    const s = request.status;
    return {
      published: true,
      accepted: ['accepted', 'picked_up', 'delivered', 'completed'].includes(s),
      pickedUp: ['picked_up', 'delivered', 'completed'].includes(s),
      delivered: ['delivered', 'completed'].includes(s),
    };
  };

  const steps = getStepConfig();

  const handleAccept = () => {
    acceptRequest(request.id);
    Taro.showToast({ title: '接单成功！', icon: 'success' });
  };

  const handlePickUp = () => {
    markPickedUp(request.id);
    Taro.showToast({ title: '已标记取件', icon: 'success' });
  };

  const handleDeliver = () => {
    markDelivered(request.id, 'https://picsum.photos/id/598/400/300');
    Taro.showToast({ title: '已标记送达', icon: 'success' });
  };

  const handleException = () => {
    Taro.navigateTo({ url: `/pages/exception/index?id=${request.id}` });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View
          className={styles.statusBanner}
          style={{
            background:
              request.status === 'exception'
                ? 'rgba(245, 63, 63, 0.06)'
                : isExpiring(request.deadline) && request.status === 'pending'
                ? 'rgba(245, 63, 63, 0.04)'
                : 'rgba(255, 107, 53, 0.04)',
          }}
        >
          <View className={styles.statusInfo}>
            <Text className={styles.statusEmoji}>{statusEmoji[request.status]}</Text>
            <View>
              <Text className={styles.statusText}>{statusText[request.status]}</Text>
              <Text className={styles.statusSubtext}>
                {isExpiring(request.deadline) && request.status === 'pending'
                  ? '⏰ 快超时了，快来帮帮忙！'
                  : `截止时间：${request.deadline}`}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.rewardBox}>
          <Text className={styles.rewardIcon}>🧧</Text>
          <Text className={styles.rewardAmount}>¥{request.reward}</Text>
          <Text className={styles.rewardLabel}>感谢红包</Text>
        </View>

        <View className={styles.progressSteps}>
          <View className={styles.step}>
            <View className={classnames(styles.stepDot, steps.published ? styles.stepDotDone : styles.stepDot)} />
            <Text className={classnames(styles.stepLabel, steps.published ? styles.stepLabelDone : styles.stepLabel)}>
              已发布
            </Text>
          </View>
          <View className={classnames(styles.stepLine, steps.accepted ? styles.stepLineDone : styles.stepLine)} />
          <View className={styles.step}>
            <View
              className={classnames(
                styles.stepDot,
                steps.accepted ? (steps.pickedUp ? styles.stepDotDone : styles.stepDotActive) : styles.stepDot
              )}
            />
            <Text
              className={classnames(
                styles.stepLabel,
                steps.accepted ? (steps.pickedUp ? styles.stepLabelDone : styles.stepLabelActive) : styles.stepLabel
              )}
            >
              已接单
            </Text>
          </View>
          <View className={classnames(styles.stepLine, steps.pickedUp ? styles.stepLineDone : steps.accepted ? styles.stepLineActive : styles.stepLine)} />
          <View className={styles.step}>
            <View
              className={classnames(
                styles.stepDot,
                steps.pickedUp ? (steps.delivered ? styles.stepDotDone : styles.stepDotActive) : styles.stepDot
              )}
            />
            <Text
              className={classnames(
                styles.stepLabel,
                steps.pickedUp ? (steps.delivered ? styles.stepLabelDone : styles.stepLabelActive) : styles.stepLabel
              )}
            >
              已取件
            </Text>
          </View>
          <View className={classnames(styles.stepLine, steps.delivered ? styles.stepLineDone : steps.pickedUp ? styles.stepLineActive : styles.stepLine)} />
          <View className={styles.step}>
            <View
              className={classnames(
                styles.stepDot,
                steps.delivered ? styles.stepDotDone : styles.stepDot
              )}
            />
            <Text
              className={classnames(
                styles.stepLabel,
                steps.delivered ? styles.stepLabelDone : styles.stepLabel
              )}
            >
              已送达
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📍</Text>快递柜信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>快递柜</Text>
            <Text className={styles.infoValue}>{request.lockerLocation}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>柜号</Text>
            <Text className={styles.infoValue}>{request.lockerName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>取件码</Text>
            <View style={{ flex: 1 }}>
              {showCode ? (
                <View className={styles.codeBox}>
                  <Text className={styles.codeText}>{request.pickupCode}</Text>
                </View>
              ) : codeCompleted ? (
                <Text className={styles.codeHidden}>已完成，取件码已隐藏</Text>
              ) : request.isCodeEncrypted ? (
                <Text className={styles.codeHidden}>🔒 接单后查看取件码</Text>
              ) : (
                <Text className={styles.codeHidden}>接单后查看取件码</Text>
              )}
              {showCode && (
                <Text className={styles.codeRevealHint}>请妥善保管取件码，完成送达后将自动隐藏</Text>
              )}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>最晚取件</Text>
            <Text
              className={styles.infoValue}
              style={{ color: isExpiring(request.deadline) ? '#F53F3F' : undefined, fontWeight: isExpiring(request.deadline) ? 600 : 400 }}
            >
              {request.deadline}
              {isExpiring(request.deadline) && ' ⚠️'}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📦</Text>包裹信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>包裹大小</Text>
            <Text className={styles.infoValue}>{sizeLabels[request.packageSize]}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>送达位置</Text>
            <Text className={styles.infoValue}>{request.deliveryLocation}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>标签</Text>
            <View className={styles.tagGroup}>
              {request.isFragile && (
                <View className={classnames(styles.tag, styles.tagFragile)}>
                  <Text className={styles.tagText}>⚠️ 易碎</Text>
                </View>
              )}
              {request.packageSize === 'large' && (
                <View className={classnames(styles.tag, styles.tagHeavy)}>
                  <Text className={styles.tagText}>💪 重件</Text>
                </View>
              )}
              {request.isCodeEncrypted && (
                <View className={classnames(styles.tag, styles.tagEncrypted)}>
                  <Text className={styles.tagText}>🔒 加密</Text>
                </View>
              )}
            </View>
          </View>
          {request.description && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.descText}>{request.description}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>👤</Text>发布人
          </Text>
          <View className={styles.publisherCard}>
            <Image className={styles.publisherAvatar} src={request.publisherAvatar} mode="aspectFill" />
            <View className={styles.publisherInfo}>
              <Text className={styles.publisherName}>{request.publisherName}</Text>
              <Text className={styles.publisherBuilding}>{request.publisherBuilding}</Text>
            </View>
          </View>
        </View>

        {request.status === 'exception' && request.exceptionType && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>⚠️</Text>异常信息
            </Text>
            <View className={styles.exceptionBanner}>
              <Text className={styles.exceptionIcon}>🚨</Text>
              <View className={styles.exceptionContent}>
                <Text className={styles.exceptionTitle}>
                  {exceptionLabels[request.exceptionType] || '异常'}
                </Text>
                {request.exceptionDesc && (
                  <Text className={styles.exceptionDesc}>{request.exceptionDesc}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {request.placementPhoto && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📸</Text>放置照片
            </Text>
            <Image className={styles.photoImg} src={request.placementPhoto} mode="aspectFill" />
          </View>
        )}
      </ScrollView>

      {(canAccept || canPickUp || canDeliver || canReportException) && (
        <View className={styles.bottomBar}>
          {canReportException && (
            <View className={classnames(styles.actionBtn, styles.dangerBtn)} onClick={handleException}>
              <Text className={styles.actionText}>异常上报</Text>
            </View>
          )}
          {canAccept && (
            <View className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={handleAccept}>
              <Text className={styles.actionText}>我来帮忙</Text>
            </View>
          )}
          {canPickUp && (
            <View className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={handlePickUp}>
              <Text className={styles.actionText}>已取件</Text>
            </View>
          )}
          {canDeliver && (
            <View className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={handleDeliver}>
              <Text className={styles.actionText}>已送达</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default DetailPage;
