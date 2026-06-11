import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRainStore } from '@/store/useRainStore';
import type { OrderStatus, OrderPlatform, TimeoutRisk } from '@/types';
import { STATUS_LABEL_MAP, PLATFORM_LABEL_MAP } from '@/types';
import OrderItem from '@/components/OrderItem';
import Tag from '@/components/Tag';

type StatusFilter = 'all' | OrderStatus;
type PlatformFilter = 'all' | OrderPlatform;
type RiskFilter = 'all' | TimeoutRisk;

const statusTabs: { key: StatusFilter; label: string; countKey?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'cooking', label: '制作中' },
  { key: 'ready', label: '待取餐' },
  { key: 'picked', label: '配送中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
];

const riskTabs: { key: RiskFilter; label: string }[] = [
  { key: 'all', label: '全部风险' },
  { key: 'critical', label: '极危' },
  { key: 'high', label: '高' },
  { key: 'medium', label: '中' },
  { key: 'low', label: '低' }
];

const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderRisk, updateOrder } = useRainStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');

  const summary = useMemo(() => {
    const total = orders.length;
    const inProgress = orders.filter(o =>
      o.status === 'pending' || o.status === 'cooking' || o.status === 'ready'
    ).length;
    const risky = orders.filter(o =>
      (o.status !== 'completed' && o.status !== 'cancelled') &&
      (o.timeoutRisk === 'critical' || o.timeoutRisk === 'high')
    ).length;
    const done = orders.filter(o => o.status === 'completed').length;
    return { total, inProgress, risky, done };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (platformFilter !== 'all' && o.platform !== platformFilter) return false;
      if (riskFilter !== 'all' && o.timeoutRisk !== riskFilter) return false;
      return true;
    }).sort((a, b) => {
      const riskW = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      if (riskW[a.timeoutRisk] !== riskW[b.timeoutRisk]) {
        return riskW[a.timeoutRisk] - riskW[b.timeoutRisk];
      }
      return b.createdAt - a.createdAt;
    });
  }, [orders, statusFilter, platformFilter, riskFilter]);

  const statusCounts = useMemo(() => {
    const m: Record<StatusFilter, number> = { all: orders.length };
    statusTabs.forEach(t => {
      if (t.key !== 'all') m[t.key] = orders.filter(o => o.status === t.key).length;
    });
    return m;
  }, [orders]);

  const handleStatusChange = (id: string, s: OrderStatus) => {
    updateOrderStatus(id, s);
    Taro.showToast({ title: '状态已更新', icon: 'success', duration: 1000 });
  };

  return (
    <View className={styles.page}>
      <View className={styles.filterBar}>
        {/* 状态筛选 */}
        <ScrollView scrollX className={styles.filterTabs}>
          {statusTabs.map(t => (
            <View
              key={t.key}
              className={classnames(
                styles.filterTab,
                statusFilter === t.key && styles.filterTabActive
              )}
              onClick={() => setStatusFilter(t.key)}
            >
              <Text className={styles.filterTabText}>
                {t.label}
                {t.key !== 'all' && statusCounts[t.key] > 0 && ` (${statusCounts[t.key]})`}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 风险筛选 */}
        <ScrollView scrollX className={styles.filterTabs} style={{ marginBottom: '16rpx' }}>
          {riskTabs.map(t => (
            <View
              key={t.key}
              className={classnames(
                styles.filterTab,
                riskFilter === t.key && styles.filterTabActive
              )}
              onClick={() => setRiskFilter(t.key)}
            >
              <Text className={styles.filterTabText}>{t.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 平台筛选 */}
        <View className={styles.platformFilter}>
          <View
            className={classnames(
              styles.platformBtn,
              platformFilter === 'all' && styles.platformBtnActiveEleme
            )}
            onClick={() => setPlatformFilter('all')}
          >
            <Text className={styles.platformBtnText}>全部平台</Text>
          </View>
          <View
            className={classnames(
              styles.platformBtn,
              platformFilter === 'meituan' && styles.platformBtnActiveMeituan
            )}
            onClick={() => setPlatformFilter(platformFilter === 'meituan' ? 'all' : 'meituan')}
          >
            <Text className={styles.platformBtnText}>🟡 美团</Text>
          </View>
          <View
            className={classnames(
              styles.platformBtn,
              platformFilter === 'eleme' && styles.platformBtnActiveEleme
            )}
            onClick={() => setPlatformFilter(platformFilter === 'eleme' ? 'all' : 'eleme')}
          >
            <Text className={styles.platformBtnText}>🔵 饿了么</Text>
          </View>
          <View
            className={classnames(
              styles.platformBtn,
              platformFilter === 'jddj' && styles.platformBtnActiveJddj
            )}
            onClick={() => setPlatformFilter(platformFilter === 'jddj' ? 'all' : 'jddj')}
          >
            <Text className={styles.platformBtnText}>🔴 京东</Text>
          </View>
        </View>
      </View>

      {/* 数据概览 */}
      <View className={styles.summaryBox}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryVal}>{summary.total}</Text>
          <Text className={styles.summaryLabel}>今日总单</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryVal, styles.summaryValSuccess)}>
            {summary.inProgress}
          </Text>
          <Text className={styles.summaryLabel}>进行中</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryVal, styles.summaryValDanger)}>
            {summary.risky}
          </Text>
          <Text className={styles.summaryLabel}>风险单</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryVal, styles.summaryValWarning)}>
            {summary.done}
          </Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
      </View>

      {/* 列表头部 */}
      <View className={styles.listHeader}>
        <Text className={styles.listHeaderTitle}>📋 订单列表</Text>
        <Text className={styles.listHeaderCount}>共 {filtered.length} 单</Text>
      </View>

      {filtered.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyEmoji}>🧘</Text>
          <Text className={styles.emptyTitle}>暂无符合条件的订单</Text>
          <Text className={styles.emptySub}>试试调整筛选条件</Text>
        </View>
      ) : (
        filtered.map(o => (
          <OrderItem
            key={o.id}
            order={o}
            onStatusChange={handleStatusChange}
            onRiskChange={updateOrderRisk}
            onOrderChange={updateOrder}
            showEdit
          />
        ))
      )}

      <View style={{ height: '160rpx' }} />
    </View>
  );
};

export default OrdersPage;
