import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import StatusTag from '@/components/StatusTag';
import { usePickupStore } from '@/store/pickupStore';
import { currentUser } from '@/data/users';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { getMyPublished } = usePickupStore();

  const myPublished = useMemo(() => getMyPublished(), []);

  const menuItems = [
    { icon: '📍', text: '我的地址管理', action: () => {} },
    { icon: '🔔', text: '消息通知', action: () => {} },
    { icon: '💬', text: '意见反馈', action: () => {} },
    { icon: 'ℹ️', text: '关于邻帮取', action: () => {} },
  ];

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <Image className={styles.avatar} src={currentUser.avatar} mode="aspectFill" />
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>{currentUser.name}</Text>
          <Text className={styles.profileBuilding}>{currentUser.building} · 热心邻居</Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{currentUser.helpCount}</Text>
          <Text className={styles.statLabel}>帮忙次数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{currentUser.publishCount}</Text>
          <Text className={styles.statLabel}>发布需求</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>¥86</Text>
          <Text className={styles.statLabel}>获得红包</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>我发布的请求
        </Text>
        {myPublished.length > 0 ? (
          myPublished.slice(0, 5).map((req) => (
            <View
              key={req.id}
              className={styles.requestItem}
              onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${req.id}` })}
            >
              <View className={styles.requestInfo}>
                <Text className={styles.requestLocker}>
                  {req.lockerLocation} · {req.lockerName}
                </Text>
                <Text className={styles.requestTime}>
                  {req.createdAt} · {req.deliveryLocation}
                </Text>
              </View>
              <Text className={styles.requestReward}>¥{req.reward}</Text>
              <StatusTag status={req.status} />
            </View>
          ))
        ) : (
          <Text style={{ fontSize: '24rpx', color: '#86909C', textAlign: 'center', padding: '32rpx 0' }}>
            暂无发布记录
          </Text>
        )}
      </View>

      <View className={styles.menuList}>
        {menuItems.map((item, index) => (
          <View key={index} className={styles.menuItem} onClick={item.action}>
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuText}>{item.text}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MinePage;
