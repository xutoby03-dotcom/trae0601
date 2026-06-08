import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { FilterType } from '@/types/pickup';
import { usePickupStore } from '@/store/pickupStore';
import { currentUser } from '@/data/users';
import RequestCard from '@/components/RequestCard';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const filterOptions: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'expiring', label: '快超时', icon: '⚡' },
  { key: 'building', label: '同楼栋', icon: '🏢' },
  { key: 'heavy', label: '重件', icon: '💪' },
];

const HomePage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const {
    currentFilter,
    setFilter,
    setSearchKeyword: setStoreKeyword,
    getFilteredRequests,
    isExpiring,
    requests,
  } = usePickupStore();

  React.useEffect(() => {
    setStoreKeyword(searchKeyword);
  }, [searchKeyword, setStoreKeyword]);

  const filteredRequests = useMemo(() => {
    return getFilteredRequests();
  }, [searchKeyword, currentFilter, requests]);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests]
  );
  const expiringCount = useMemo(
    () => requests.filter((r) => r.status === 'pending' && isExpiring(r.deadline)).length,
    [requests, isExpiring]
  );
  const buildingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending' && r.publisherBuilding === currentUser.building).length,
    [requests]
  );

  const handleCardClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>👋 你好，{currentUser.name}</Text>
        <Text className={styles.subtitle}>{currentUser.building} · 邻里互助，帮取快递</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索快递柜、位置、发布人..."
            placeholderClass={styles.searchInput}
            value={searchKeyword}
            onInput={(e) => handleSearch(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.summaryBar}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNum}>{pendingCount}</Text>
          <Text className={styles.summaryLabel}>待帮忙</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNum}>{expiringCount}</Text>
          <Text className={styles.summaryLabel}>快超时</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNum}>{buildingCount}</Text>
          <Text className={styles.summaryLabel}>同楼栋</Text>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {filterOptions.map((opt) => (
          <View
            key={opt.key}
            className={classnames(styles.filterTab, currentFilter === opt.key && styles.filterTabActive)}
            onClick={() => setFilter(opt.key)}
          >
            <Text
              className={classnames(styles.tabText, currentFilter === opt.key && styles.tabTextActive)}
            >
              {opt.icon} {opt.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              isExpiring={isExpiring(req.deadline)}
              isSameBuilding={req.publisherBuilding === currentUser.building}
              onClick={() => handleCardClick(req.id)}
            />
          ))
        ) : (
          <EmptyState
            message="暂无待帮忙的快递"
            description={searchKeyword ? '换个关键词试试吧' : '当前分类下没有待取快递'}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default HomePage;
