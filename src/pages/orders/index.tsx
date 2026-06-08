import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { OrderTab, PickupRequest } from '@/types/pickup';
import { usePickupStore } from '@/store/pickupStore';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const exceptionLabels: Record<string, string> = {
  code_invalid: '取件码失效',
  door_stuck: '柜门打不开',
  package_damaged: '包裹破损',
  other: '其他异常',
};

const OrdersPage: React.FC = () => {
  const { orderTab, setOrderTab, getMyOrders, markPickedUp, markDelivered, requests } =
    usePickupStore();

  const myOrders = useMemo(() => getMyOrders(), [orderTab, requests]);

  const handlePickup = (id: string) => {
    markPickedUp(id);
    Taro.showToast({ title: '已标记取件', icon: 'success' });
  };

  const handleDeliver = (id: string) => {
    markDelivered(id, 'https://picsum.photos/id/598/400/300');
    Taro.showToast({ title: '已标记送达', icon: 'success' });
  };

  const handleException = (id: string) => {
    Taro.navigateTo({ url: `/pages/exception/index?id=${id}` });
  };

  const getStepStatus = (req: PickupRequest) => {
    const status = req.status;
    return {
      accepted: ['accepted', 'picked_up', 'delivered', 'completed'].includes(status),
      pickedUp: ['picked_up', 'delivered', 'completed'].includes(status),
      delivered: ['delivered', 'completed'].includes(status),
    };
  };

  const renderCode = (req: PickupRequest) => {
    if (req.status === 'delivered' || req.status === 'completed') {
      return <Text className={styles.codeHidden}>已隐藏</Text>;
    }
    if (req.status === 'accepted' || req.status === 'picked_up') {
      return <Text className={styles.codeRevealed}>{req.pickupCode}</Text>;
    }
    return <Text className={styles.codeHidden}>接单后可见</Text>;
  };

  const renderProgress = (req: PickupRequest) => {
    const steps = getStepStatus(req);
    return (
      <View className={styles.progressSteps}>
        <View className={styles.step}>
          <View className={styles.stepContent}>
            <View className={classnames(styles.stepDot, styles.stepDotDone)} />
            <Text className={classnames(styles.stepLabel, styles.stepLabelDone)}>已接单</Text>
          </View>
        </View>
        <View className={classnames(styles.stepLine, styles.stepLineDone)} />
        <View className={styles.step}>
          <View className={styles.stepContent}>
            <View
              className={classnames(
                styles.stepDot,
                steps.pickedUp ? styles.stepDotDone : steps.accepted ? styles.stepDotActive : styles.stepDot
              )}
            />
            <Text
              className={classnames(
                styles.stepLabel,
                steps.pickedUp
                  ? styles.stepLabelDone
                  : steps.accepted
                  ? styles.stepLabelActive
                  : styles.stepLabel
              )}
            >
              已取件
            </Text>
          </View>
        </View>
        <View className={classnames(styles.stepLine, steps.pickedUp ? styles.stepLineDone : steps.accepted ? styles.stepLineActive : styles.stepLine)} />
        <View className={styles.step}>
          <View className={styles.stepContent}>
            <View
              className={classnames(
                styles.stepDot,
                steps.delivered ? styles.stepDotDone : steps.pickedUp ? styles.stepDotActive : styles.stepDot
              )}
            />
            <Text
              className={classnames(
                styles.stepLabel,
                steps.delivered
                  ? styles.stepLabelDone
                  : steps.pickedUp
                  ? styles.stepLabelActive
                  : styles.stepLabel
              )}
            >
              已送达
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActions = (req: PickupRequest) => {
    if (req.status === 'accepted') {
      return (
        <View className={styles.orderFooter}>
          <View className={classnames(styles.actionBtn, styles.dangerBtn)} onClick={() => handleException(req.id)}>
            <Text className={styles.actionText}>异常上报</Text>
          </View>
          <View className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={() => handlePickup(req.id)}>
            <Text className={styles.actionText}>已取件</Text>
          </View>
        </View>
      );
    }
    if (req.status === 'picked_up') {
      return (
        <View className={styles.orderFooter}>
          <View className={classnames(styles.actionBtn, styles.dangerBtn)} onClick={() => handleException(req.id)}>
            <Text className={styles.actionText}>异常上报</Text>
          </View>
          <View className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={() => handleDeliver(req.id)}>
            <Text className={styles.actionText}>已送达</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View className={styles.container}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, orderTab === 'active' && styles.tabItemActive)}
          onClick={() => setOrderTab('active')}
        >
          <Text className={classnames(styles.tabText, orderTab === 'active' && styles.tabTextActive)}>
            进行中
          </Text>
        </View>
        <View
          className={classnames(styles.tabItem, orderTab === 'completed' && styles.tabItemActive)}
          onClick={() => setOrderTab('completed')}
        >
          <Text className={classnames(styles.tabText, orderTab === 'completed' && styles.tabTextActive)}>
            已完成
          </Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {myOrders.length > 0 ? (
          myOrders.map((req) => (
            <View key={req.id} className={styles.orderCard}>
              <View className={styles.orderHeader}>
                <View className={styles.orderLocker}>
                  <Text className={styles.orderLockerIcon}>📍</Text>
                  <Text className={styles.orderLockerText}>
                    {req.lockerLocation} · {req.lockerName}
                  </Text>
                </View>
                <StatusTag status={req.status} />
              </View>

              <View className={styles.orderBody}>
                <View className={styles.orderInfoRow}>
                  <Text className={styles.orderInfoLabel}>发布人</Text>
                  <Text className={styles.orderInfoValue}>{req.publisherName} · {req.publisherBuilding}</Text>
                </View>
                <View className={styles.orderInfoRow}>
                  <Text className={styles.orderInfoLabel}>取件码</Text>
                  {renderCode(req)}
                </View>
                <View className={styles.orderInfoRow}>
                  <Text className={styles.orderInfoLabel}>送达</Text>
                  <Text className={styles.orderInfoValue}>{req.deliveryLocation}</Text>
                </View>
                <View className={styles.orderInfoRow}>
                  <Text className={styles.orderInfoLabel}>红包</Text>
                  <Text className={styles.orderInfoValue} style={{ color: '#F5222D', fontWeight: 600 }}>
                    ¥{req.reward}
                  </Text>
                </View>
              </View>

              {renderProgress(req)}

              {req.status === 'exception' && req.exceptionType && (
                <View className={styles.exceptionBanner}>
                  <Text className={styles.exceptionIcon}>⚠️</Text>
                  <Text className={styles.exceptionText}>
                    {exceptionLabels[req.exceptionType] || '异常'}
                    {req.exceptionDesc ? `：${req.exceptionDesc}` : ''}
                  </Text>
                </View>
              )}

              {req.placementPhoto && (
                <View className={styles.photoRow}>
                  <Text className={styles.photoLabel}>放置照片：</Text>
                  <Image className={styles.photoImg} src={req.placementPhoto} mode="aspectFill" />
                </View>
              )}

              {renderActions(req)}
            </View>
          ))
        ) : (
          <EmptyState
            message={orderTab === 'active' ? '暂无进行中的接单' : '暂无已完成的接单'}
            description={orderTab === 'active' ? '去任务大厅看看有没有能帮上忙的' : '完成接单后这里会显示记录'}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersPage;
