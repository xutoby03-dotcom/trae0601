import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useFoodStore } from '@/store/foodStore';
import { FoodStatus } from '@/types/food';
import { getRemainingDays } from '@/utils/date';
import FoodCard from '@/components/FoodCard';
import GroupSection from '@/components/GroupSection';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const foods = useFoodStore(state => state.foods);
  const updateStatuses = useFoodStore(state => state.updateStatuses);

  useDidShow(() => {
    updateStatuses();
    console.log('[IndexPage] onShow: updated statuses');
  });

  usePullDownRefresh(() => {
    updateStatuses();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const sortByUrgency = (foodList: typeof foods) => {
    return [...foodList].sort((a, b) => {
      const daysA = getRemainingDays(a.cookDate, a.expectedDays);
      const daysB = getRemainingDays(b.cookDate, b.expectedDays);
      return daysA - daysB;
    });
  };

  const groups = useMemo(() => {
    const statuses: FoodStatus[] = ['tonight', 'expiring', 'frozen', 'processed'];
    return statuses.map(status => ({
      status,
      foods: sortByUrgency(foods.filter(f => f.status === status))
    }));
  }, [foods]);

  const activeCount = useMemo(() => {
    return foods.filter(f => f.status !== 'processed').length;
  }, [foods]);

  const tonightCount = useMemo(() => {
    return foods.filter(f => f.status === 'tonight').length;
  }, [foods]);

  const frozenCount = useMemo(() => {
    return foods.filter(f => f.status === 'frozen').length;
  }, [foods]);

  const handleAdd = () => {
    Taro.navigateTo({
      url: '/pages/add/index'
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>👋 今天也要好好吃饭哦</Text>
        <Text className={styles.subGreeting}>冰箱里的剩菜，它们在等你~</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{activeCount}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{tonightCount}</Text>
            <Text className={styles.statLabel}>今晚先吃</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{frozenCount}</Text>
            <Text className={styles.statLabel}>冷冻中</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {groups.map(group => (
          <GroupSection
            key={group.status}
            status={group.status}
            count={group.foods.length}
            defaultExpanded={group.status !== 'processed'}
          >
            {group.foods.map(food => (
              <FoodCard key={food.id} food={food} />
            ))}
          </GroupSection>
        ))}

        {foods.length === 0 && (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🍽️</Text>
            <Text className={styles.emptyText}>冰箱空空如也</Text>
            <Text className={styles.emptySubtext}>点击右下角按钮添加第一份剩菜吧</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.addButton} onClick={handleAdd}>
        <Text className={styles.addIcon}>+</Text>
      </View>
    </View>
  );
};

export default IndexPage;
