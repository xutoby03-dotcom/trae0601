import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { FoodRecord } from '@/types/food';
import { getRemainingDays, formatDateCN, isExpired } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';
import styles from './index.module.scss';

interface FoodCardProps {
  food: FoodRecord;
  onClick?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onClick }) => {
  const remainingDays = getRemainingDays(food.cookDate, food.expectedDays);
  const expired = isExpired(food.cookDate, food.expectedDays);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${food.id}`
      });
    }
  };

  return (
    <View
      className={classnames(styles.card, expired && styles.expired)}
      onClick={handleClick}
    >
      {food.photo ? (
        <Image
          className={styles.image}
          src={food.photo}
          mode="aspectFill"
          lazyLoad
          onError={(e) => console.error('[FoodCard] Image load error:', e)}
        />
      ) : (
        <View className={styles.imagePlaceholder}>
          <Text className={styles.placeholderText}>🍽️</Text>
        </View>
      )}

      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{food.name}</Text>
          <StatusBadge status={food.status} size="sm" />
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.label}>位置:</Text>
          <Text className={styles.value}>{food.location}</Text>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.label}>日期:</Text>
          <Text className={styles.value}>{formatDateCN(food.cookDate)}</Text>
        </View>

        <View className={styles.footer}>
          <View className={styles.suitableTags}>
            {food.suitableFor.slice(0, 2).map((item, index) => (
              <Text key={index} className={styles.tag}>{item}</Text>
            ))}
          </View>

          <View
            className={classnames(
              styles.daysBadge,
              remainingDays <= 1 && styles.warning,
              remainingDays < 0 && styles.danger
            )}
          >
            {remainingDays > 0 ? (
              <Text className={styles.daysText}>还剩 {remainingDays} 天</Text>
            ) : remainingDays === 0 ? (
              <Text className={styles.daysText}>今天到期</Text>
            ) : (
              <Text className={styles.daysText}>已过期 {-remainingDays} 天</Text>
            )}
          </View>
        </View>
      </View>

      {food.status === 'processed' && food.processInfo && (
        <View className={styles.processedOverlay}>
          <Text className={styles.processedText}>
            {food.processInfo.type === 'eaten' && '🍽️ 已吃掉'}
            {food.processInfo.type === 'discarded' && '🗑️ 已倒掉'}
            {food.processInfo.type === 'transformed' && '✨ 已改造'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default FoodCard;
