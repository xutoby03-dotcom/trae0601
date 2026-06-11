import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRainStore } from '@/store/useRainStore';
import { RAIN_LABEL_MAP, RAIN_EMOJI_MAP, GROUP_LABEL_MAP } from '@/types';
import type { BoardGroupType } from '@/types';
import WarningBanner from '@/components/WarningBanner';
import StatCard from '@/components/StatCard';
import StatusGroupCard from '@/components/StatusGroupCard';
import OrderItem from '@/components/OrderItem';
import dayjs from 'dayjs';

const DashboardPage: React.FC = () => {
  const {
    weather, kitchen, staff, dishStocks, orders, warnings,
    activeGroup, setActiveGroup,
    updateOrderStatus, updateOrderRisk, acknowledgeWarning,
    generateWarnings, getGroupedOrders, getLowStockDishes
  } = useRainStore();

  const [tick, setTick] = useState(0);

  useEffect(() => {
    generateWarnings();
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useDidShow(() => {
    generateWarnings();
    setTick(t => t + 1);
  });

  const grouped = useMemo(() => getGroupedOrders(), [orders, tick, kitchen, staff, dishStocks, weather]);
  const lowStock = useMemo(() => getLowStockDishes(), [dishStocks, tick]);
  const activeWarnings = warnings.filter(w => !w.acknowledged).slice(0, 3);
  const currentGroupOrders = grouped[activeGroup]
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return riskOrder[a.timeoutRisk] - riskOrder[b.timeoutRisk];
    });

  const rainForecastLabel = RAIN_LABEL_MAP[weather.forecastNextHour];
  const groups: BoardGroupType[] = ['normal', 'backlog', 'noRider', 'lowStock'];

  const totalPending = orders.filter(o =>
    o.status === 'pending' || o.status === 'cooking' || o.status === 'ready'
  ).length;
  const criticalCount = orders.filter(o =>
    (o.status !== 'completed' && o.status !== 'cancelled') &&
    (o.timeoutRisk === 'critical' || o.timeoutRisk === 'high')
  ).length;

  const handleRefresh = () => {
    generateWarnings();
    setTick(t => t + 1);
    setTimeout(() => Taro.stopPullDownRefresh(), 800);
  };

  useEffect(() => {
    Taro.eventCenter.on('__taroStartPullDownRefresh', handleRefresh);
    return () => Taro.eventCenter.off('__taroStartPullDownRefresh');
  }, []);

  return (
    <ScrollView scrollY className={styles.page}>
      {/* Hero天气头部 */}
      <View className={styles.hero}>
        <View className={styles.heroTop}>
          <View className={styles.heroLeft}>
            <View className={styles.weatherIcon}>
              <Text className={styles.weatherEmoji}>{RAIN_EMOJI_MAP[weather.rainLevel]}</Text>
            </View>
            <View className={styles.weatherInfo}>
              <Text className={styles.rainLabel}>{RAIN_LABEL_MAP[weather.rainLevel]}</Text>
              <Text className={styles.temperature}>
                🌡️ {weather.temperature}°C · 风力{weather.windLevel}级
              </Text>
            </View>
          </View>
          <View className={styles.heroRight}>
            <Text className={styles.forecastLabel}>未来1小时</Text>
            <Text className={styles.forecastVal}>
              {RAIN_EMOJI_MAP[weather.forecastNextHour]} {rainForecastLabel}
            </Text>
          </View>
        </View>
        <View className={styles.heroStats}>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatVal}>{kitchen.currentOrderCount}</Text>
            <Text className={styles.heroStatLabel}>今日订单</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatVal}>{totalPending}</Text>
            <Text className={styles.heroStatLabel}>进行中</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatVal}>{criticalCount}</Text>
            <Text className={styles.heroStatLabel}>风险单</Text>
          </View>
        </View>
      </View>

      {/* 预警横幅 */}
      {activeWarnings.length > 0 && (
        <View>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>⚠️ 紧急预警</Text>
            <Text className={styles.sectionSubtitle}>
              {dayjs(weather.recordedAt).format('HH:mm')} 检测
            </Text>
          </View>
          {activeWarnings.map(w => (
            <WarningBanner
              key={w.id}
              warning={w}
              onAcknowledge={() => acknowledgeWarning(w.id)}
            />
          ))}
        </View>
      )}

      {/* 关键指标 */}
      <View className={styles.sectionTitle}>
        <Text className={styles.sectionTitleText}>📊 实时数据</Text>
        <Text className={styles.sectionSubtitle}>点击录入页可修改</Text>
      </View>
      <View className={styles.statsGrid}>
        <StatCard
          label="预计出餐"
          value={kitchen.estimatedCookTime}
          unit="分钟"
          tone={kitchen.estimatedCookTime > 25 ? 'danger' : kitchen.estimatedCookTime > 18 ? 'warning' : 'primary'}
          icon="🍳"
          subLabel="平均"
          subValue={`${kitchen.avgCookTimeToday}分钟`}
          trend={kitchen.estimatedCookTime > kitchen.avgCookTimeToday ? 'up' : 'down'}
          trendValue={`${Math.abs(kitchen.estimatedCookTime - kitchen.avgCookTimeToday)}分钟`}
        />
        <StatCard
          label="待制作"
          value={kitchen.pendingOrderCount}
          unit="单"
          tone={kitchen.pendingOrderCount > 12 ? 'danger' : kitchen.pendingOrderCount > 6 ? 'warning' : 'success'}
          icon="📋"
          subLabel="后厨产能"
          subValue={`${staff.availableChefs}/${staff.totalChefs}名厨师`}
        />
        <StatCard
          label="可用骑手"
          value={staff.availableRiders}
          unit="人"
          tone={staff.availableRiders < 3 ? 'danger' : staff.availableRiders < 5 ? 'warning' : 'info'}
          icon="🏍️"
          subLabel="总计骑手"
          subValue={`${staff.totalRiders}人`}
          trend={staff.availableRiders < 3 ? 'up' : 'flat'}
          trendValue={staff.availableRiders < 3 ? '紧缺' : '正常'}
        />
        <StatCard
          label="低库存菜品"
          value={lowStock.length}
          unit="种"
          tone={lowStock.length >= 3 ? 'danger' : lowStock.length > 0 ? 'warning' : 'success'}
          icon="📦"
          subLabel="今日出餐"
          subValue={`${dishStocks.reduce((s, d) => s + d.todaySold, 0)}份`}
        />
      </View>

      {/* 低库存面板 */}
      {lowStock.length > 0 && (
        <View className={styles.lowStockPanel}>
          <View className={styles.lowStockHeader}>
            <Text className={styles.lowStockTitle}>
              📉 库存告急菜品
            </Text>
            <Text className={styles.lowStockCount}>共 {lowStock.length} 项</Text>
          </View>
          <View className={styles.lowStockList}>
            {lowStock.map(d => {
              const ratio = Math.max(0, Math.min(1, d.currentStock / Math.max(1, d.safeStock)));
              const barColor = ratio < 0.3 ? '#EF4444' : ratio < 0.6 ? '#F59E0B' : '#10B981';
              return (
                <View className={styles.stockRow} key={d.id}>
                  <View className={styles.stockNameBox}>
                    <Text className={styles.stockName}>
                      {d.isHot && '🔥'} {d.name}
                    </Text>
                    <Text className={styles.stockCat}>{d.category}</Text>
                  </View>
                  <View className={styles.stockBarWrap}>
                    <View
                      className={styles.stockBar}
                      style={{ width: `${ratio * 100}%`, background: barColor }}
                    />
                  </View>
                  <View className={styles.stockVal}>
                    <Text className={styles.stockCurr}>{d.currentStock}</Text>
                    <Text className={styles.stockSafe}>/ {d.safeStock} 份</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 四状态分组 */}
      <View className={styles.sectionTitle}>
        <Text className={styles.sectionTitleText}>📁 订单分组</Text>
        <Text className={styles.sectionSubtitle}>共 {orders.length} 单</Text>
      </View>
      <View className={styles.groupList}>
        {groups.map(g => (
          <StatusGroupCard
            key={g}
            type={g}
            count={g === 'normal'
              ? grouped[g].filter(o => o.status !== 'completed' && o.status !== 'cancelled').length
              : grouped[g].length
            }
            active={activeGroup === g}
            onClick={() => setActiveGroup(g)}
          />
        ))}
      </View>

      {/* 当前分组订单列表 */}
      <View className={styles.sectionTitle}>
        <Text className={styles.sectionTitleText}>
          🧾 {GROUP_LABEL_MAP[activeGroup]}订单
        </Text>
        <Text className={styles.sectionSubtitle}>
          风险优先排序
        </Text>
      </View>
      <View>
        <View className={styles.ordersHeader}>
          <Text className={styles.ordersHeaderTitle}>{GROUP_LABEL_MAP[activeGroup]}</Text>
          <Text className={styles.ordersHeaderCount}>
            {currentGroupOrders.length} 单进行中
          </Text>
        </View>
        <View className={styles.ordersBody}>
          <View className={styles.orderList}>
            {currentGroupOrders.length === 0 ? (
              <View className={styles.emptyBox}>
                <Text className={styles.emptyEmoji}>🎉</Text>
                <Text className={styles.emptyText}>当前分组暂无订单</Text>
              </View>
            ) : (
              currentGroupOrders.map(o => (
                <OrderItem
                  key={o.id}
                  order={o}
                  onStatusChange={updateOrderStatus}
                  onRiskChange={updateOrderRisk}
                />
              ))
            )}
          </View>
        </View>
      </View>

      <View style={{ height: '160rpx' }} />
    </ScrollView>
  );
};

export default DashboardPage;
