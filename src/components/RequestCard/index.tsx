import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { PickupRequest } from '@/types/pickup';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface RequestCardProps {
  request: PickupRequest;
  isExpiring: boolean;
  isSameBuilding: boolean;
  onClick?: () => void;
}

const sizeLabels: Record<string, string> = {
  small: '小件',
  medium: '中件',
  large: '重件',
};

const sizeIcons: Record<string, string> = {
  small: '📦',
  medium: '📦',
  large: '🏋️',
};

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isExpiring,
  isSameBuilding,
  onClick,
}) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <Text className={styles.lockerIcon}>📍</Text>
          <Text className={styles.lockerLocation}>{request.lockerLocation}</Text>
          <Text className={styles.lockerName}>{request.lockerName}</Text>
        </View>
        <StatusTag status={request.status} />
      </View>

      {(isExpiring || isSameBuilding || request.isFragile || request.packageSize === 'large') && (
        <View className={styles.tagRow}>
          {isExpiring && (
            <View className={classnames(styles.tagBadge, styles.urgent)}>
              <Text className={styles.tagBadgeText}>⚡快超时</Text>
            </View>
          )}
          {isSameBuilding && (
            <View className={classnames(styles.tagBadge, styles.building)}>
              <Text className={styles.tagBadgeText}>🏢同楼栋</Text>
            </View>
          )}
          {request.packageSize === 'large' && (
            <View className={classnames(styles.tagBadge, styles.heavy)}>
              <Text className={styles.tagBadgeText}>💪重件</Text>
            </View>
          )}
          {request.isFragile && (
            <View className={classnames(styles.tagBadge, styles.fragile)}>
              <Text className={styles.tagBadgeText}>⚠️易碎</Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>送达</Text>
          <Text className={styles.infoValue}>{request.deliveryLocation}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>大小</Text>
          <Text className={styles.infoValue}>
            {sizeIcons[request.packageSize]} {sizeLabels[request.packageSize]}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>取件码</Text>
          <Text className={styles.codeValue}>
            {request.isCodeEncrypted ? '🔒 已加密' : '未加密'}
          </Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.publisherInfo}>
          <Text className={styles.publisherName}>{request.publisherName}</Text>
          <Text className={styles.buildingTag}>{request.publisherBuilding}</Text>
        </View>
        <View className={styles.footerRight}>
          <Text className={styles.deadline}>
            截止 {request.deadline.split(' ')[1] || request.deadline}
          </Text>
          <View className={styles.reward}>
            <Text className={styles.rewardIcon}>🧧</Text>
            <Text className={styles.rewardAmount}>¥{request.reward}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RequestCard;
